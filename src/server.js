const app = require('./app');
const config = require('./config/config');
const { connectDatabase, closeDatabase } = require('./db/database');
const { log } = require('./middleware/logger');

let server;
let isShuttingDown = false;
const openSockets = new Set();

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  app.locals.isShuttingDown = true;

  log('info', 'Shutdown signal received', { signal });

  const forceShutdownTimer = setTimeout(() => {
    log('error', 'Graceful shutdown timed out', { signal });

    for (const socket of openSockets) {
      socket.destroy();
    }

    process.exit(1);
  }, config.shutdownTimeoutMs);

  forceShutdownTimer.unref();

  server.close(async (error) => {
    if (error) {
      log('error', 'HTTP server closed with error', {
        signal,
        error: error.message
      });
    }

    try {
      await closeDatabase();
      clearTimeout(forceShutdownTimer);
      log('info', 'Graceful shutdown completed', { signal });
      process.exit(error ? 1 : 0);
    } catch (closeError) {
      clearTimeout(forceShutdownTimer);
      log('error', 'Database close failed during shutdown', {
        signal,
        error: closeError.message
      });
      process.exit(1);
    }
  });
}

async function start() {
  await connectDatabase();

  server = app.listen(config.port, '0.0.0.0', () => {
    log('info', 'Server started', {
      port: config.port,
      appVersion: config.appVersion,
      nodeEnv: config.nodeEnv,
      dbClient: config.dbClient
    });
  });

  server.on('connection', (socket) => {
    openSockets.add(socket);
    socket.on('close', () => {
      openSockets.delete(socket);
    });
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  log('error', 'Server failed to start', {
    error: error.message,
    stack: config.nodeEnv === 'production' ? undefined : error.stack
  });
  process.exit(1);
});
