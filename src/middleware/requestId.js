const { randomUUID } = require('crypto');

function requestId(req, res, next) {
  const incomingRequestId = req.get('X-Request-ID');
  const currentRequestId = incomingRequestId && incomingRequestId.trim()
    ? incomingRequestId.trim()
    : randomUUID();

  req.requestId = currentRequestId;
  res.setHeader('X-Request-ID', currentRequestId);

  next();
}

module.exports = requestId;
