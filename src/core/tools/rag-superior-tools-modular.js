// RAG Superior Tools Modular Orchestrator
// Enterprise compliant - imports from modular components

import { executeStateTrackerTool } from './state-tracker-tool.js';
import { executeContextBridgeTool } from './context-bridge-tool.js';
import { executeVectorSearchTool } from './vector-search-tool.js';
import { executeRagSuperiorTool, executeRagSuperiorManagerTool } from './rag-manager-tool.js';

// Export all modular functions for MCP integration
export {
  executeStateTrackerTool,
  executeContextBridgeTool,
  executeVectorSearchTool,
  executeRagSuperiorTool,
  executeRagSuperiorManagerTool
};

// Default export for compatibility
export default {
  executeStateTrackerTool,
  executeContextBridgeTool,
  executeVectorSearchTool,
  executeRagSuperiorTool,
  executeRagSuperiorManagerTool
};
