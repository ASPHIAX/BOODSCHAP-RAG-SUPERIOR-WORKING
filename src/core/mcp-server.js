// MCP WebSocket Server Class Module
// Enterprise compliant - clean class definition

import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { initializeMCPTools } from './mcp-tools.js';
import { handleInitialize, handleToolsList, handleToolCall } from './mcp-handlers-slim.js';

export class MCPWebSocketServer {
  constructor() {
    this.clients = new Map();
    this.tools = new Map();
    this.resources = new Map();

    this.initializeMCPCapabilities();
  }

  initializeMCPCapabilities() {
    // Initialize tools from module and use them directly
    const allTools = initializeMCPTools();
    this.tools = new Map(allTools);

    // Core MCP resources
    this.resources.set('server_capabilities', {
      uri: 'capability://server',
      name: 'Server Capabilities',
      description: 'Information about server capabilities and features'
    });
  }

  async handleMessage(ws, data) {
    try {
      switch (data.method) {
      case 'initialize':
        return await handleInitialize(data, ws, this.clients);
      case 'tools/list':
        return await handleToolsList(data, this.tools);
      case 'tools/call':
        return await handleToolCall(data, this.tools);
      case 'resources/list':
        return {
          jsonrpc: '2.0',
          id: data.id || null,
          result: { resources: Array.from(this.resources.values()) }
        };
      default:
        // Don't respond to notifications (no id field)
        if (!data.id && !data.hasOwnProperty("id")) {
          return; // Don't send anything
        }
        return {
          jsonrpc: '2.0',
          id: data.id,
          error: { code: -32601, message: `Method not found: ${data.method}` }
        };
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: data.id || null,
        error: { code: -32603, message: error.message }
      };
    }
  }
}

export default MCPWebSocketServer;
