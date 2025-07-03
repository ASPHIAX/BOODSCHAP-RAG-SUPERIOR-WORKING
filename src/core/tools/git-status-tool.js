// Git Status Tool Module
// Enterprise compliant - single responsibility

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function executeGitStatusTool(args, requestId) {
  try {
    const { stdout } = await execAsync('git status', { cwd: '/app' });

    return {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        content: [{
          type: 'text',
          text: stdout || 'No git status output'
        }]
      }
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id: requestId,
      error: {
        code: -1,
        message: `Git status error: ${error.message}`
      }
    };
  }
}

export default { executeGitStatusTool };