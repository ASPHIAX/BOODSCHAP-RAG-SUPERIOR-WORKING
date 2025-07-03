// Echo Tool Module
// Enterprise compliant - single responsibility

export async function executeEchoTool(args, requestId) {
  return {
    jsonrpc: '2.0',
    id: requestId,
    result: {
      content: [{
        type: 'text',
        text: args.message || 'Hello from MCP!'
      }]
    }
  };
}

export default { executeEchoTool };