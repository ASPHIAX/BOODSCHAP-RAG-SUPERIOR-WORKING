/**
 * RAG Superior MCP Tools - Clean Enterprise Architecture
 * Integrates Context Bridge, State Tracker, and Enhanced Vector Search
 * Addresses ClickUp Task 86c47e3x7: Fix Context Bridge State Bloat & Old Information Syndrome
 */

import { BOSSContextBridge, bossContextBridge } from './context-bridge.js';
import { BOSSStateTracker, bossStateTracker } from './state-tracker.js';
import { EnhancedVectorSearch, enhancedVectorSearch } from './vector-search.js';

/**
 * RAG Superior Manager - Orchestrates all RAG operations
 * with timestamp intelligence and session lifecycle management
 */
export class RAGSuperiorManager {
  constructor(options = {}) {
    this.contextBridge = new BOSSContextBridge(options.contextBridge);
    this.stateTracker = new BOSSStateTracker(options.stateTracker);
    this.vectorSearch = new EnhancedVectorSearch(options.vectorSearch);
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      // Initialize all components
      await this.stateTracker.execute({ operation: 'init_system' });
      this.initialized = true;
    }
    return { success: true, timestamp: new Date().toISOString() };
  }

  /**
   * Smart context retrieval with timestamp prioritization
   * Solves "Old Information Syndrome"
   */
  async getRelevantContext(projectName, query, options = {}) {
    await this.initialize();

    try {
      // Get active sessions with timestamp scoring
      const activeSessions = await this.contextBridge.execute({
        operation: 'list_active_sessions',
        projectName
      });

      if (!activeSessions.success) {
        return activeSessions;
      }

      // Get current project state
      const currentState = await this.stateTracker.execute({
        operation: 'get_current_state',
        projectName
      });

      // Combine context with vector search intelligence
      const searchResult = await this.vectorSearch.searchWithTimestampPriority(
        query,
        activeSessions.sessions,
        options
      );

      return {
        success: true,
        projectName,
        query,
        relevantSessions: searchResult.results,
        currentState: currentState.success ? currentState.state : null,
        totalSessions: activeSessions.total,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        projectName,
        query
      };
    }
  }

  /**
   * Capture session with automatic cleanup
   */
  async captureSessionSmart(sessionId, projectName, context, metadata = {}) {
    await this.initialize();

    // Capture the session
    const captureResult = await this.contextBridge.execute({
      operation: 'capture_session',
      sessionId,
      projectName,
      context,
      metadata: {
        ...metadata,
        enhancedVersion: '2.0.0',
        timestampIntelligence: true
      }
    });

    // Auto-cleanup if needed
    if (captureResult.success) {
      await this.contextBridge.execute({
        operation: 'cleanup_expired',
        strategy: 'smart_archive'
      });
    }

    return captureResult;
  }
}

// MCP Tool Exports for Server Integration
export const ragSuperiorTools = [
  {
    ...bossContextBridge,
    handler: async (params) => {
      const bridge = new BOSSContextBridge();
      return await bridge.execute(params);
    }
  },
  {
    ...bossStateTracker,
    handler: async (params) => {
      const tracker = new BOSSStateTracker();
      return await tracker.execute(params);
    }
  },
  {
    ...enhancedVectorSearch,
    handler: async (params) => {
      const search = new EnhancedVectorSearch();
      return await search.searchWithTimestampPriority(
        params.query,
        params.documents || [],
        params
      );
    }
  },
  {
    name: 'rag_superior_smart_search',
    description: 'Smart context retrieval with timestamp prioritization - solves Old Information Syndrome',
    inputSchema: {
      type: 'object',
      properties: {
        projectName: { type: 'string' },
        query: { type: 'string' },
        freshnessDecayFactor: { type: 'number' },
        maxResults: { type: 'number' }
      },
      required: ['projectName', 'query']
    },
    handler: async (params) => {
      const manager = new RAGSuperiorManager();
      return await manager.getRelevantContext(params.projectName, params.query, params);
    }
  }
];

export { BOSSContextBridge, BOSSStateTracker, EnhancedVectorSearch };



// Compatibility wrappers for existing MCP handler interface
export async function executeStateTrackerTool(args, requestId) {
  try {
    const instance = new BOSSStateTracker();
    const result = await instance.execute(args);
    return { jsonrpc: "2.0", id: requestId, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } };
  } catch (error) {
    return { jsonrpc: "2.0", id: requestId, error: { code: -32603, message: "Internal error", data: error.message } };
  }
}

export async function executeVectorSearchTool(args, requestId) {
  try {
    const instance = new EnhancedVectorSearch();
    const result = await instance.searchAll(args.query, ["qdrant"], args.limit || 10);
    return { jsonrpc: "2.0", id: requestId, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } };
  } catch (error) {
    return { jsonrpc: "2.0", id: requestId, error: { code: -32603, message: "Internal error", data: error.message } };
  }
}

export async function executeRagSuperiorTool(args, requestId) {
  try {
    const manager = new RAGSuperiorManager();
    const result = await manager.getRelevantContext(args.projectName, args.query, args);
    return { jsonrpc: "2.0", id: requestId, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } };
  } catch (error) {
    return { jsonrpc: "2.0", id: requestId, error: { code: -32603, message: "Internal error", data: error.message } };
  }
}

export async function executeRagSuperiorManagerTool(args, requestId) {
  try {
    const manager = new RAGSuperiorManager();
    const result = await manager.getRelevantContext(args.projectName, args.query, args);
    return { jsonrpc: "2.0", id: requestId, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } };
  } catch (error) {
    return { jsonrpc: "2.0", id: requestId, error: { code: -32603, message: "Internal error", data: error.message } };
  }
}

export async function executeContextBridgeTool(args, requestId) {
  try {
    const instance = new BOSSContextBridge();
    const result = await instance.execute(args);
    return { jsonrpc: "2.0", id: requestId, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } };
  } catch (error) {
    return { jsonrpc: "2.0", id: requestId, error: { code: -32603, message: "Internal error", data: error.message } };
  }
}

export default { executeStateTrackerTool, executeVectorSearchTool, executeRagSuperiorTool, executeRagSuperiorManagerTool, executeContextBridgeTool };
