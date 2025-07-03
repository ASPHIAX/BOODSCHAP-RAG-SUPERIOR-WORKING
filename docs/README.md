# MASTER-CONTAINER-MCP Documentation

## Overview
Enterprise MCP Server Implementation with 2025-03-26 Protocol

**Version**: 1.0.0
**Generated**: 2025-07-03T11:06:49.429Z

## MCP Protocol
- **Version**: 2025-03-26
- **Transport**: WebSocket
- **Tools**: 3 (echo, calculate, get_server_info)
- **Resources**: 1 (server_capabilities)

## Network Endpoints
- **MCP WebSocket**: ws://192.168.68.94:3002/mcp
- **Health Check**: http://192.168.68.94:3003/health
- **Main Server**: http://192.168.68.94:3002/

## Security Features
- **Security Score**: 19/19 (Perfect)
- **Vulnerabilities**: 0
- **Features**: Helmet, CORS, Rate Limiting, Input Validation

## Deployment
```bash
docker run -d --name ultimate-working -p 3002:3000 -p 3003:3001 ultimate-mcp-server:latest
```

*Auto-generated: 2025-07-03T11:06:49.429Z*