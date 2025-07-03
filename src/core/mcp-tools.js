// MCP Tools Definition Module
// Enterprise compliant, modular design

export const mcpTools = new Map();

// Initialize core MCP tools
export function initializeMCPTools() {
  // Core MCP tools
  mcpTools.set('echo', {
    name: 'echo',
    description: 'Echo back the input message',
    inputSchema: {
      type: 'object',
      properties: { message: { type: 'string' } },
      required: ['message']
    }
  });

  mcpTools.set('get_server_info', {
    name: 'get_server_info',
    description: 'Get server information and status',
    inputSchema: { type: 'object', properties: {} }
  });

  mcpTools.set('calculate', {
    name: 'calculate',
    description: 'Perform mathematical calculations',
    inputSchema: {
      type: 'object',
      properties: {
        operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'], description: 'Mathematical operation to perform' },
        a: { type: 'number', description: 'First operand' },
        b: { type: 'number', description: 'Second operand' }
      },
      required: ['operation', 'a', 'b']
    }
  });

  mcpTools.set('searchDocumentation', {
    name: 'searchDocumentation',
    description: 'Search BOSS MCP documentation with smart context optimization',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural language query about BOSS MCP system' },
        max_results: { type: 'integer', default: 3, description: 'Maximum results to return' },
        collections: { type: 'array', items: { type: 'string' }, description: 'Specific collections to search' }
      },
      required: ['query']
    }
  });

  mcpTools.set('getServiceStatus', {
    name: 'getServiceStatus',
    description: 'Get real-time health status of BOSS MCP services with response times',
    inputSchema: {
      type: 'object',
      properties: {
        service_name: { type: 'string', description: 'Specific service or all' },
        timeout: { type: 'integer', default: 3000, description: 'Timeout in milliseconds' },
        include_metrics: { type: 'boolean', default: true, description: 'Include detailed metrics in response' }
      },
      required: []
    }
  });

  // Enterprise tools
  mcpTools.set('searchMultiDatabase', {
    name: 'searchMultiDatabase',
    description: 'Search across multiple databases using direct connections',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        databases: { type: 'array', items: { type: 'string' }, default: ['postgres'], description: 'Databases to search: postgres, mongodb, neo4j, qdrant' },
        limit: { type: 'integer', default: 10, description: 'Maximum results per database' }
      },
      required: ['query']
    }
  });

  mcpTools.set('generateDocumentation', {
    name: 'generateDocumentation',
    description: 'Generate comprehensive documentation for BOSS containers with Docker Socket API access',
    inputSchema: {
      type: 'object',
      properties: {
        container_name: { type: 'string', description: 'Name of the container to document' },
        doc_type: { type: 'string', enum: ['admin', 'user', 'developer'], default: 'admin', description: 'Type of documentation to generate' },
        include_examples: { type: 'boolean', default: true, description: 'Include usage examples in documentation' }
      },
      required: ['container_name']
    }
  });

  mcpTools.set('getDocumentByPath', {
    name: 'getDocumentByPath',
    description: 'Retrieve specific document content by file path',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Document file path (relative to /home/mcpuser/app/ or absolute)' },
        format: { type: 'string', default: 'text', description: 'Output format' }
      },
      required: ['path']
    }
  });

  // RAG Superior tools
  mcpTools.set('boss_state_tracker', {
    name: 'boss_state_tracker',
    description: 'State tracking system for BOSS network with structured project management',
    inputSchema: {
      type: 'object',
      properties: {
        operation: { type: 'string', enum: ['init_system', 'create_project_state', 'update_state', 'get_current_state'], description: 'Operation to perform' },
        projectName: { type: 'string' },
        state: { type: 'object' }
      },
      required: ['operation']
    }
  });

  

  mcpTools.set('boss_context_bridge', {
    name: 'boss_context_bridge',
    description: 'Seamless context transfer between chat sessions with intelligent merging and recovery',
    inputSchema: {
      type: 'object',
      properties: {
        operation: { type: 'string', enum: ['capture_session', 'restore_session', 'bridge_sessions', 'get_session_context', 'merge_contexts', 'create_handoff', 'complete_handoff', 'list_active_sessions', 'cleanup_expired'], description: 'Context bridge operation to perform' },
        sessionId: { type: 'string', description: 'Current chat session ID' },
        previousSessionId: { type: 'string', description: 'Previous session ID for bridging' },
        projectName: { type: 'string', description: 'Associated project name' },
        context: { type: 'object', description: 'Context data to capture or merge' },
        metadata: { type: 'object', description: 'Additional session metadata' }
      },
      required: ['operation']
    }
  });

  

  
  mcpTools.set('enhanced_vector_search', {
    name: 'enhanced_vector_search',
    description: 'Enhanced vector search with timestamp-based relevance scoring and freshness weighting',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query for vector similarity' },
        collection: { type: 'string', description: 'Vector collection to search' },
        limit: { type: 'integer', default: 10, description: 'Maximum results to return' },
        freshness_boost: { type: 'boolean', default: true, description: 'Apply timestamp-based relevance boost' },
        decay_factor: { type: 'number', default: 0.1, description: 'Freshness decay factor for scoring' }
      },
      required: ['query']
    }
  });

  mcpTools.set('rag_superior_manager', {
    name: 'rag_superior_manager',
    description: 'RAG Superior Manager orchestration layer with integrated context bridge, state tracking, and enhanced vector search',
    inputSchema: {
      type: 'object',
      properties: {
        operation: { type: 'string', enum: ['search_with_context', 'smart_retrieval', 'session_aware_search', 'initialize_session', 'cleanup_session'], description: 'RAG operation to perform' },
        query: { type: 'string', description: 'Search query for RAG operations' },
        session_id: { type: 'string', description: 'Session ID for context-aware operations' },
        project_name: { type: 'string', description: 'Project name for state tracking' },
        context_size: { type: 'integer', default: 5, description: 'Number of context items to include' },
        enable_freshness: { type: 'boolean', default: true, description: 'Enable timestamp-based freshness scoring' }
      },
      required: ['operation']
    }
  });


  mcpTools.set('rag_superior_smart_search', {
    name: 'rag_superior_smart_search',
    description: 'Smart search functionality for RAG Superior with project context and session management',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query for RAG operations' },
        projectName: { type: 'string', description: 'Project name for context' },
        maxResults: { type: 'integer', default: 5, description: 'Maximum results to return' }
      },
      required: ['query']
    }
  });

  return mcpTools;
}

export default { mcpTools, initializeMCPTools };