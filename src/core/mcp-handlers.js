// MCP Protocol Handlers Module
// Enterprise compliant - functions under 50 lines each

import { executeGitStatusTool } from './tools/git-status-tool.js';
import { mcpSchemas, validateMCPMessage } from './mcp-validation.js';

// Handle initialize request
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
      protocolVersion: '2025-03-26',
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

// Handle tools/list request
export async function handleToolsList(data, tools) {
  return {
    jsonrpc: '2.0',
    id: data.id,
    result: {
      tools: Array.from(tools.values())
    }
  };
}

// Handle tools/call request
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

  // Execute tool based on name
  switch (toolName) {
  case 'echo':
    return {
      jsonrpc: '2.0',
      id: data.id,
      result: { content: [{ type: 'text', text: toolArgs.message || 'Hello from MCP!' }] }
    };
  case 'calculate':
    return await handleCalculate(toolArgs, data.id);
  case 'git_status':
    return await executeGitStatusTool(toolArgs, data.id);

  case 'get_server_info':
    return await handleServerInfo(data.id);
  default:
    return {
      jsonrpc: '2.0',
      id: data.id,
      error: { code: -32601, message: `Unknown tool: ${toolName}` }
    };
  }
}

// Handle calculate tool
async function handleCalculate(args, requestId) {
  const { operation, a, b } = args;
  let result;

  try {
    switch (operation) {
    case 'add':
      result = a + b;
      break;
    case 'subtract':
      result = a - b;
      break;
    case 'multiply':
      result = a * b;
      break;
    case 'divide':
      if (b === 0) {
        throw new Error('Division by zero');
      }
      result = a / b;
      break;
    default:
      throw new Error(`Unknown operation: ${operation}`);
    }

    return {
      jsonrpc: '2.0',
      id: requestId,
      result: { content: [{ type: 'text', text: `${a} ${operation} ${b} = ${result}` }] }
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id: requestId,
      error: { code: -32603, message: error.message }
    };
  }
}

// Handle server info tool
async function handleServerInfo(requestId) {
  return {
    jsonrpc: '2.0',
    id: requestId,
    result: {
      content: [{
        type: 'text',
        text: `Ultimate MCP Server v1.0.0
Protocol: MCP 2025-03-26
Transport: WebSocket
Security: Enterprise Grade
Status: Operational`
      }]
    }
  };
}

// Handle resources/list request
export async function handleResourcesList(data, resources) {
  return {
    jsonrpc: '2.0',
    id: data.id,
    result: {
      resources: Array.from(resources.values())
    }
  };
}

export default {
  handleInitialize,
  handleToolsList,
  handleToolCall,
  handleResourcesList
};
