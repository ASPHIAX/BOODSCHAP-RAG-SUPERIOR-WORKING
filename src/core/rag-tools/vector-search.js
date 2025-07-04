import { MongoDBClient } from './mongodb-client.js';

// Constants to avoid magic numbers
const DEFAULT_LIMIT = 10;
const MAX_SCROLL_LIMIT = 50;
const SCORE_MULTIPLIER = 2;
const MULTI_MATCH_BONUS = 1.5;
const PHRASE_MATCH_BONUS = 10;
const PRIORITY_BOOST_MULTIPLIER = 1.5;
const HOURS_IN_DAY = 24;
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const MS_PER_HOUR = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
const DEFAULT_DECAY_FACTOR = 0.1;
const DEFAULT_PRIORITY_HOURS = 48;
class QdrantClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://192.168.68.94:19104';
    this.collections = ['boss-lessons-learned', 'boss-development-docs'];
  }

  async searchVectors(query, limit = DEFAULT_LIMIT, collection = null) {
    try {
      const targetCollections = collection ? [collection] : this.collections;
      const allResults = [];

      for (const coll of targetCollections) {
        const results = await this.searchCollection(query, coll, limit);
        allResults.push(...results);
      }

      // Sort by relevance score and limit results
      allResults.sort((a, b) => b.score - a.score);
      const limitedResults = allResults.slice(0, limit);

      return {
        success: true,
        source: 'qdrant',
        results: limitedResults,
        total: limitedResults.length,
        query: query
      };

    } catch (error) {
      return {
        success: false,
        source: 'qdrant',
        error: error.message,
        query: query
      };
    }
  }

  async searchCollection(query, collectionName, limit) {
    const scrollPayload = {
      limit: Math.min(limit, MAX_SCROLL_LIMIT),
      with_payload: true,
      with_vector: false,
      filter: {
        must: [{ key: 'content', match: { text: query } }]
      }
    };

    // Use global fetch which is available in Node.js 18+
    const response = await globalThis.fetch(`${this.baseUrl}/collections/${collectionName}/points/scroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scrollPayload)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.result && data.result.points) {
        return data.result.points.map(point => ({
          id: point.id,
          payload: point.payload,
          collection: collectionName,
          score: this.calculateTextScore(query, point.payload.content || '')
        }));
      }
    }
    return [];
  }

  calculateTextScore(query, content) {
    if (!content) {
      return 0;
    }

    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();

    let score = 0;
    let exactMatches = 0;

    // Count exact word matches
    queryWords.forEach(word => {
      if (word.length > SCORE_MULTIPLIER) { // Skip very short words
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = (contentLower.match(regex) || []).length;
        score += matches * SCORE_MULTIPLIER;
        if (matches > 0) {
          exactMatches++;
        }
      }
    });

    // Bonus calculations
    if (exactMatches > 1) {
      score += exactMatches * MULTI_MATCH_BONUS;
    }

    if (queryWords.length > 1 && contentLower.includes(query.toLowerCase())) {
      score += PHRASE_MATCH_BONUS;
    }

    return score;
  }
}
class MultiDatabaseSearch {
  constructor(options = {}) {
    this.qdrant = new QdrantClient(options.qdrant);
    this.mongodb = new MongoDBClient();
    this.freshnessDecayFactor = options.freshnessDecayFactor || DEFAULT_DECAY_FACTOR;
    this.maxActiveResults = options.maxActiveResults || DEFAULT_LIMIT;
    this.latestPriorityHours = options.latestPriorityHours || DEFAULT_PRIORITY_HOURS;
  }

  async searchAll(query, databases = ['qdrant'], limit = DEFAULT_LIMIT) {
    const promises = this.createSearchPromises(query, databases, limit);
    const results = await Promise.all(promises);

    return this.formatSearchResults(query, results);
  }

  createSearchPromises(query, databases, limit) {
    const promises = [];

    if (databases.includes('qdrant')) {
      promises.push(
        this.qdrant.searchVectors(query, limit)
          .then(result => ({ database: 'qdrant', ...result }))
          .catch(error => ({ database: 'qdrant', success: false, error: error.message }))
      );
    }

    if (databases.includes('mongodb') || databases.includes('admin')) {
      promises.push(
        this.mongodb.searchDocuments(query, limit)
          .then(result => ({ database: 'admin', ...result }))
          .catch(error => ({ database: 'admin', success: false, error: error.message }))
      );
    }

    return promises;
  }

  formatSearchResults(query, results) {
    return {
      success: true,
      query: query,
      databases: results.reduce((acc, result) => {
        acc[result.database] = result;
        return acc;
      }, {}),
      summary: {
        totalSources: results.length,
        successfulSources: results.filter(r => r.success).length,
        totalResults: results.reduce((sum, r) => sum + (r.total || r.count || 0), 0)
      },
      timestamp: new Date().toISOString()
    };
  }

  calculateRelevance(semanticScore, timestamp, boost = 1.0) {
    const now = Date.now();
    const ageHours = (now - timestamp) / MS_PER_HOUR;

    let finalBoost = boost;
    if (ageHours <= this.latestPriorityHours) {
      finalBoost *= PRIORITY_BOOST_MULTIPLIER;
    }

    const ageDays = ageHours / HOURS_IN_DAY;
    const freshnessPenalty = Math.exp(-this.freshnessDecayFactor * ageDays);

    return semanticScore * freshnessPenalty * finalBoost;
  }

  /**
   * RESTORED: Enhanced search with timestamp-based relevance scoring
   * The MISSING method that sophisticated tools were calling!
   */
  async searchWithTimestampPriority(query, /* documents = [], */ options = {}) {
    const config = this.parseTimestampSearchOptions(options);

    try {
      const searchResult = await this.searchAll(query, config.databases, config.limit);

      if (!searchResult.success) {
        return searchResult;
      }

      if (config.freshness_boost && searchResult.databases.qdrant?.results) {
        this.applyTimestampScoring(searchResult, config.decay_factor);
      }

      return this.formatTimestampSearchResult(searchResult, query, config);

    } catch (error) {
      return {
        success: false,
        error: error.message,
        query: query,
        timestamp: new Date().toISOString()
      };
    }
  }

  parseTimestampSearchOptions(options) {
    return {
      limit: options.limit || DEFAULT_LIMIT,
      freshness_boost: options.freshness_boost !== false,
      decay_factor: options.decay_factor || DEFAULT_DECAY_FACTOR,
      databases: options.databases || ['qdrant']
    };
  }

  applyTimestampScoring(searchResult, decayFactor) {
    const now = new Date();

    searchResult.databases.qdrant.results = searchResult.databases.qdrant.results.map(result => {
      const timestampScore = this.calculateTimestampScore(result, now, decayFactor);
      const originalScore = result.score || 1.0;

      return {
        ...result,
        enhanced_score: originalScore * timestampScore,
        timestamp_boost: timestampScore
      };
    });

    searchResult.databases.qdrant.results.sort((a, b) => b.enhanced_score - a.enhanced_score);
  }

  calculateTimestampScore(result, now, decayFactor) {
    const timestampField = result.payload?.created_at || result.payload?.upload_timestamp;
    if (!timestampField) {
      return 1.0;
    }

    const timestamp = new Date(timestampField);
    const daysSince = (now - timestamp) / (MS_PER_HOUR * HOURS_IN_DAY);
    return Math.exp(-decayFactor * daysSince);
  }

  formatTimestampSearchResult(searchResult, query, config) {
    return {
      success: true,
      query: query,
      results: searchResult.databases.qdrant?.results || [],
      total: searchResult.summary.totalResults,
      freshness_applied: config.freshness_boost,
      decay_factor: config.decay_factor,
      timestamp: new Date().toISOString()
    };
  }
}

export { QdrantClient, MongoDBClient, MultiDatabaseSearch };
export const EnhancedVectorSearch = MultiDatabaseSearch;

export const enhancedVectorSearch = {
  name: 'enhanced_vector_search',
  description: 'Enhanced vector search with timestamp-based relevance scoring',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query for vector similarity' },
      collection: { type: 'string', description: 'Vector collection to search' },
      limit: { type: 'integer', default: DEFAULT_LIMIT, description: 'Maximum results to return' },
      freshness_boost: { type: 'boolean', default: true, description: 'Apply timestamp-based relevance boost' },
      decay_factor: { type: 'number', default: DEFAULT_DECAY_FACTOR, description: 'Freshness decay factor' }
    },
    required: ['query']
  }
};
