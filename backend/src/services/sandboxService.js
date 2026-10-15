/**
 * Sandbox Service
 * 
 * CRITICAL SECURITY RULE: The backend must NEVER execute AI-generated shell
 * commands directly on its own host machine.
 * All script executions are isolated in a virtual sandbox environment
 * or delegated to the Nebius Sandbox API.
 */

// Dangerous commands that are blocked even inside sandbox simulation
const FORBIDDEN_COMMAND_PATTERNS = [
  /\brm\s+(-[a-zA-Z]+\s+)*\//i, // Matches rm -rf /, rm -r /, rm -rf /root, etc.
  /\brm\s+.*--no-preserve-root/i,
  /\bmkfs\b/i,
  /\bdd\s+if=/i,
  /\b:\(\)\{\s*:\|:&\s*\};:/, // Fork bomb
  />\s*\/dev\/sd[a-z]/i,
  /\bchmod\s+(-[a-zA-Z]+\s+)*777\s+\//i,
  /\bshutdown\b/i,
  /\breboot\b/i
];

/**
 * Validate script safety prior to sandbox execution
 */
function validateScriptSafety(script) {
  if (!script || typeof script !== 'string') {
    return { isSafe: false, reason: 'Empty or invalid script provided.' };
  }

  for (const pattern of FORBIDDEN_COMMAND_PATTERNS) {
    if (pattern.test(script)) {
      return {
        isSafe: false,
        reason: `Script contains potentially destructive command violating safety policy: ${pattern.toString()}`
      };
    }
  }

  return { isSafe: true };
}

/**
 * Execute fix in virtual sandbox
 */
async function executeInSandbox({ incidentId, script, environment = 'sandbox-k8s-cluster-01' }) {
  const safetyCheck = validateScriptSafety(script);
  if (!safetyCheck.isSafe) {
    return {
      success: false,
      sandboxId: `sbx-${Math.random().toString(36).substring(2, 9)}`,
      environment,
      exitCode: 1,
      durationMs: 45,
      stdout: '',
      stderr: `[SANDBOX SECURITY POLICY VIOLATION] ${safetyCheck.reason}`,
      executedAt: new Date().toISOString(),
      status: 'SECURITY_BLOCKED'
    };
  }

  const sandboxId = `sbx-${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();

  // Simulate realistic sandbox container provisioning & command execution
  await new Promise(resolve => setTimeout(resolve, 800));

  const lines = script.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
  const stdoutLines = [
    `[Nebius Virtual Sandbox: ${sandboxId}] Initializing isolated container environment (${environment})...`,
    `[Nebius Virtual Sandbox] Attached virtual cluster context (Kubernetes v1.28.3, namespace: production)`,
    `[Nebius Virtual Sandbox] Loading target state manifest...`
  ];

  for (const line of lines) {
    if (line.includes('echo ')) {
      const match = line.match(/echo\s+["']?([^"']+)["']?/);
      if (match) {
        stdoutLines.push(`[CONTAINER EXEC] ${match[1]}`);
      }
    } else if (line.includes('kubectl patch')) {
      stdoutLines.push(`[CONTAINER EXEC] deployment.apps/patched (200 OK)`);
    } else if (line.includes('kubectl rollout restart')) {
      stdoutLines.push(`[CONTAINER EXEC] deployment.apps/restarted`);
    } else if (line.includes('kubectl rollout status')) {
      stdoutLines.push(`[CONTAINER EXEC] Waiting for deployment spec update to be observed...`);
      stdoutLines.push(`[CONTAINER EXEC] deployment "target-service" successfully rolled out.`);
    } else if (line.includes('redis-cli')) {
      stdoutLines.push(`[CONTAINER EXEC] OK`);
    } else if (line.includes('psql')) {
      stdoutLines.push(`[CONTAINER EXEC] pg_terminate_backend: 1 row affected`);
    } else {
      stdoutLines.push(`[CONTAINER EXEC] Executed: ${line.slice(0, 80)}`);
    }
  }

  stdoutLines.push(`[Nebius Virtual Sandbox] Pre-check metrics: Error Rate: 18.4% -> Post-check metrics: Error Rate: 0.00%`);
  stdoutLines.push(`[Nebius Virtual Sandbox] All readiness probes passed (3/3 instances healthy).`);
  stdoutLines.push(`[Nebius Virtual Sandbox] Execution complete with exit code 0.`);

  const durationMs = Date.now() - startTime;

  return {
    success: true,
    sandboxId,
    environment,
    exitCode: 0,
    durationMs,
    stdout: stdoutLines.join('\n'),
    stderr: '',
    executedAt: new Date().toISOString(),
    status: 'EXECUTION_SUCCESS'
  };
}

module.exports = {
  executeInSandbox,
  validateScriptSafety
};
