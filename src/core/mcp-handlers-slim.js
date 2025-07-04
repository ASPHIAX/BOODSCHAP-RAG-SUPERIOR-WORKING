// MCP Core Handlers Module
// Enterprise compliant - coordination only

import { mcpSchemas, validateMCPMessage } from './mcp-validation.js';
import { executeEchoTool } from './tools/echo-tool.js';
import { executeCalculateTool } from './tools/calculate-tool.js';
import { executeServerInfoTool } from './tools/server-info-tool.js';
import { executeStateTrackerTool, executeVectorSearchTool, executeRagSuperiorTool, executeRagSuperiorManagerTool, executeContextBridgeTool } from './rag-tools/index.js';

// Handle initialize request (30 lines)
export async function handleInitialize(data, ws, clients) {
  const { error } = validateMCPMessage(data, mcpSchemas.initialize);
  if (error) {
    return {
      jsonrpc: '2.0',
      id: data.id,
      error: { code: -32602, message: 'Invalid params', data: error.details }
    };
  }

  clients.set(ws, { initialized: true, capabilities: data.params.capabilities || {} });
  return {
    jsonrpc: '2.0',
    id: data.id,
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: { listChanged: true },
        resources: { listChanged: true }
      },
      serverInfo: {
        name: 'Ultimate MCP Server',
        version: '1.0.0'
      }
    }
  };
}

// Handle tools/list request (8 lines)
export async function handleToolsList(data, tools) {
  return {
    jsonrpc: '2.0',
    id: data.id,
    result: {
      tools: Array.from(tools.values())
    }
  };
}

// Handle tools/call request (20 lines)
export async function handleToolCall(data, tools) {
  const toolName = data.params?.name;
  const toolArgs = data.params?.arguments || {};

  if (!tools.has(toolName)) {
    return {
      jsonrpc: '2.0',
      id: data.id,
      error: { code: -32601, message: `Tool '${toolName}' not found` }
    };
  }

  // Delegate to specific tool handlers
  switch (toolName) {
  case 'echo':
    return await executeEchoTool(toolArgs, data.id);
  case 'calculate':
    console.log('SLIM HANDLER DEBUG: toolArgs=', JSON.stringify(toolArgs, null, 2));
    return await executeCalculateTool(toolArgs, data.id);
  case 'get_server_info':
    return await executeServerInfoTool(data.id);
  case 'boss_context_bridge':
    return await executeContextBridgeTool(toolArgs, data.id);
  case 'boss_state_tracker':
    return await executeStateTrackerTool(toolArgs, data.id);
  case 'enhanced_vector_search':
    return await executeVectorSearchTool(toolArgs, data.id);
  case 'rag_superior_smart_search':
    return await executeRagSuperiorTool(toolArgs, data.id);
  case 'rag_superior_manager':
    return await executeRagSuperiorManagerTool(toolArgs, data.id);
  default:
    return {
      jsonrpc: '2.0',
      id: data.id,
      error: { code: -32601, message: `Unknown tool: ${toolName}` }
    };
  }
}

export default { handleInitialize, handleToolsList, handleToolCall };