import { promises as fs } from 'fs';
import path from 'path';
import { MongoDBClient } from './mongodb-client.js';

/**
 * Enhanced RAG Superior Search with Multi-Database Support
 * Integrates Qdrant (payload search), MongoDB, PostgreSQL, Neo4j, and Redis
 */

/**
 * Qdrant Client for BOSS-QDRANT-DEV Integration
 * Uses payload-based text search since we don't have embedding generation
 */
class QdrantClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://192.168.68.94:19104';
    this.collections = ['boss-lessons-learned', 'boss-development-docs'];
  }

  async searchVectors(query, limit = 10, collection = null) {
    try {
      const targetCollections = collection ? [collection] : this.collections;
      const allResults = [];
      
      for (const coll of targetCollections) {
        // Use scroll with payload filtering for text search
        const scrollPayload = {
          limit: Math.min(limit, 50), // Reasonable limit for scroll
          with_payload: true,
          with_vector: false,
          filter: {
            must: [
              {
                key: 'content',
                match: {
                  text: query
                }
              }
            ]
          }
        };

        const response = await fetch(`${this.baseUrl}/collections/${coll}/points/scroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scrollPayload)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.result && data.result.points) {
            allResults.push(...data.result.points.map(point => ({
              id: point.id,
              payload: point.payload,
              collection: coll,
              score: this.calculateTextScore(query, point.payload.content || '')
            })));
          }
        }
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
  
  calculateTextScore(query, content) {
    if (!content) return 0;
    
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    let score = 0;
    let exactMatches = 0;
    
    // Count exact word matches
    queryWords.forEach(word => {
      if (word.length > 2) { // Skip very short words
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = (contentLower.match(regex) || []).length;
        score += matches * 2; // Weight for exact matches
        if (matches > 0) exactMatches++;
      }
    });
    
    // Bonus for having multiple query words
    if (exactMatches > 1) {
      score += exactMatches * 1.5;
    }
    
    // Check for phrase matches
    if (queryWords.length > 1) {
      const phrase = query.toLowerCase();
      if (contentLower.includes(phrase)) {
        score += 10; // High bonus for phrase match
      }
    }
    
    return score;
  }
}

/**
 * MongoDB Client
 */
const mongoClient = new MongoDBClient();

/**
 * Multi-Database Search Class
 */
class MultiDatabaseSearch {
  constructor(options = {}) {
    this.qdrant = new QdrantClient(options.qdrant);
    this.mongodb = mongoClient;
  }

  async searchAll(query, databases = ['qdrant'], limit = 10) {
    const promises = [];
    
    if (databases.includes('qdrant')) {
      promises.push(
        this.qdrant.searchVectors(query, limit)
          .then(result => ({ database: 'qdrant', ...result }))
          .catch(error => ({ database: 'qdrant', success: false, error: error.message }))
      );
    }
    
    // MongoDB search
    if (databases.includes('mongodb') || databases.includes('admin')) {
      promises.push(
        this.mongodb.searchDocuments(query, limit)
          .then(result => ({ database: 'admin', ...result }))
          .catch(error => ({ database: 'admin', success: false, error: error.message }))
      );
    }

    const results = await Promise.all(promises);
    
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
}

export { QdrantClient, MongoDBClient, MultiDatabaseSearch };
