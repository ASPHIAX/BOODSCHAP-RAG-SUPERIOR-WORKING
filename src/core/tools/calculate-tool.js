// Calculate Tool Module
// Enterprise compliant - single responsibility

export async function executeCalculateTool(args, requestId) {
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
      result: {
        content: [{
          type: 'text',
          text: `${a} ${operation} ${b} = ${result}`
        }]
      }
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id: requestId,
      error: { code: -32603, message: error.message }
    };
  }
}

export default { executeCalculateTool };