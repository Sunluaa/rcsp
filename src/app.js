const express = require('express');
const path = require('path');
const config = require('./config/config');
const quoteRoutes = require('./routes/quoteRoutes');
const requestId = require('./middleware/requestId');
const { log, requestLogger } = require('./middleware/logger');

const app = express();
const publicDir = path.join(__dirname, 'public');

app.locals.isShuttingDown = false;

app.use(requestId);
app.use(requestLogger);

app.use((req, res, next) => {
  if (!app.locals.isShuttingDown) {
    return next();
  }

  return res.status(503).json({
    status: 'unavailable',
    message: 'Service is shutting down',
    requestId: req.requestId
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use(express.static(publicDir));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: config.serviceName,
    version: config.appVersion,
    instanceId: config.instanceId,
    environment: config.nodeEnv
  });
});

app.get('/slow', async (req, res) => {
  const delayMs = 5000;

  await new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

  res.json({
    status: 'completed',
    delayMs
  });
});

app.use('/api', quoteRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    requestId: req.requestId
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;

  log('error', 'Unhandled request error', {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl || req.url,
    statusCode,
    error: error.message,
    stack: config.nodeEnv === 'production' ? undefined : error.stack
  });

  return res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : error.message,
    requestId: req.requestId
  });
});

module.exports = app;
