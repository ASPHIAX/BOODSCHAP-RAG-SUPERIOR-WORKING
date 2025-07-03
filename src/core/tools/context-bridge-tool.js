// Context Bridge Tool Module
// Enterprise compliant - RAG Superior integration

import { BOSSContextBridge } from '/app/src/core/rag-tools/context-bridge.js';

const contextBridge = new BOSSContextBridge();

export async function executeContextBridgeTool(args, requestId) {
  try {
    const result = await contextBridge.execute(args);
    
    return {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      }
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id: requestId,
      error: {
        code: -32603,
        message: 'Context bridge execution failed',
        data: error.message
      }
    };
  }
}

export default { executeContextBridgeTool };
