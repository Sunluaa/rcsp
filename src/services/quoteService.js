const quoteRepository = require('../repositories/quoteRepository');

async function getRandomQuote() {
  const quote = await quoteRepository.findRandomQuote();

  if (!quote) {
    const error = new Error('No quotes found. Run database migrations first.');
    error.statusCode = 404;
    throw error;
  }

  return quote;
}

module.exports = {
  getRandomQuote
};
