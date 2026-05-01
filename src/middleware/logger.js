const config = require('../config/config');

const levels = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function isEnabled(level) {
  const configuredLevel = levels[config.logLevel] || levels.info;
  return levels[level] >= configuredLevel;
}

function removeUndefinedFields(entry) {
  return Object.fromEntries(
    Object.entries(entry).filter(([, value]) => value !== undefined)
  );
}

function log(level, message, meta = {}) {
  if (!isEnabled(level)) {
    return;
  }

  const entry = removeUndefinedFields({
    timestamp: new Date().toISOString(),
    level,
    service: config.serviceName,
    requestId: meta.requestId,
    method: meta.method,
    path: meta.path,
    statusCode: meta.statusCode,
    durationMs: meta.durationMs,
    message,
    signal: meta.signal,
    port: meta.port,
    appVersion: meta.appVersion,
    nodeEnv: meta.nodeEnv,
    dbClient: meta.dbClient,
    email: meta.email,
    adminId: meta.adminId,
    error: meta.error,
    stack: meta.stack
  });

  const line = `${JSON.stringify(entry)}\n`;

  if (level === 'error') {
    process.stderr.write(line);
    return;
  }

  process.stdout.write(line);
}

function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const statusCode = res.statusCode;
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    log(level, 'HTTP request completed', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
      durationMs: Math.round(durationMs * 100) / 100
    });
  });

  next();
}

module.exports = {
  log,
  requestLogger
};
