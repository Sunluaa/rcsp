const path = require('path');

require('dotenv').config();

function readNumber(name, defaultValue) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === '') {
    return defaultValue;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${name} must be a number`);
  }

  return parsedValue;
}

function readString(name, defaultValue) {
  return process.env[name] || defaultValue;
}

const dbClient = readString('DB_CLIENT', 'sqlite').toLowerCase();

if (!['sqlite', 'postgres'].includes(dbClient)) {
  throw new Error('DB_CLIENT must be either "sqlite" or "postgres"');
}

module.exports = {
  nodeEnv: readString('NODE_ENV', 'development'),
  serviceName: readString('SERVICE_NAME', 'quote-demo-app'),
  port: readNumber('PORT', 8080),
  appVersion: readString('APP_VERSION', '1.0.0'),
  instanceId: readString('INSTANCE_ID', process.env.HOSTNAME || 'local'),
  dbClient,
  databaseUrl: readString(
    'DATABASE_URL',
    'postgres://app_user:app_password@localhost:5432/quotes_db'
  ),
  sqliteFile: path.resolve(readString('SQLITE_FILE', './data/app.db')),
  logLevel: readString('LOG_LEVEL', 'info').toLowerCase(),
  shutdownDrainMs: readNumber('SHUTDOWN_DRAIN_MS', 2000),
  shutdownTimeoutMs: readNumber('SHUTDOWN_TIMEOUT_MS', 10000)
};
