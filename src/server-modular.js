#!/usr/bin/env node

// Main Server Orchestration - Enterprise Modular Architecture
// All modules under enterprise limits, ESLint compliant

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import MCPWebSocketServer from './core/mcp-server.js';
import { setupSecurity } from './security/middleware.js';

dotenv.config();

// Initialize Express app
const app = express();

// Setup enterprise security
setupSecurity(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    protocol: 'MCP 2025-03-26'
  });
});

// Create HTTP server
const server = createServer(app);

// Create MCP WebSocket server
const mcpServer = new MCPWebSocketServer();
const wss = new WebSocketServer({ server, path: '/mcp' });

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  const clientId = req.socket.remoteAddress;
  console.log(`🔗 Client connected: ${clientId}`);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      const response = await mcpServer.handleMessage(ws, data);
      ws.send(JSON.stringify(response));
    } catch {
      const errorResponse = {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' }
      };
      ws.send(JSON.stringify(errorResponse));
    }
  });

  ws.on('close', () => {
    mcpServer.clients.delete(ws);
    console.log(`🔌 Client disconnected: ${clientId}`);
  });
});

// Start servers
const PORT = process.env.PORT || 3000;
const HEALTH_PORT = process.env.HEALTH_PORT || 3001;

// Health check server
app.listen(HEALTH_PORT, () => {
  console.log(`✅ Health Check Server listening on port ${HEALTH_PORT}`);
});

// Main MCP server
server.listen(PORT, () => {
  console.log('============================================================');
  console.log('🚀 Ultimate MCP Server (Modular Architecture)');
  console.log(`🔌 WebSocket MCP endpoint: ws://192.168.68.94:${PORT}/mcp`);
  console.log(`🏥 Health check: http://192.168.68.94:${HEALTH_PORT}/health`);
  console.log('🔒 Security hardening: ENABLED');
  console.log(`🛠️ Tools: ${mcpServer.tools.size} available`);
  console.log(`📚 Resources: ${mcpServer.resources.size} available`);
  console.log('🏗️ Architecture: Enterprise Modular');
  console.log('============================================================');
});
