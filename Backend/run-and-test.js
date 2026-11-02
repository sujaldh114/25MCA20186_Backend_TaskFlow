/**
 * Runner that boots the Express server and executes test-api.js against it
 */

const { runTests } = require('./test-api');

async function main() {
  console.log('[Runner] Starting Express server in background...');
  // Require server which calls app.listen()
  const app = require('./server');

  // Allow 1 second for database connection to establish
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    await runTests();
    console.log('[Runner] All verification tests passed cleanly. Exiting with status 0.');
    process.exit(0);
  } catch (error) {
    console.error('[Runner] Test execution failed:', error);
    process.exit(1);
  }
}

main();

