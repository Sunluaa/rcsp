const quoteRepository = require('../repositories/quoteRepository');
const { log } = require('../middleware/logger');

async function getRandomQuote(requestId) {
  const quote = await quoteRepository.findRandomQuote();

  if (!quote) {
    const error = new Error('No quotes found. Run database migrations first.');
    error.statusCode = 404;
    throw error;
  }

  log('info', 'Quote selected', {
    requestId,
    quoteId: quote.id
  });

  return quote;
}

module.exports = {
  getRandomQuote
};
