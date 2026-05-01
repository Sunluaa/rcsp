const express = require('express');
const quoteService = require('../services/quoteService');

const router = express.Router();

router.get('/quote', async (req, res, next) => {
  try {
    const quote = await quoteService.getRandomQuote();
    res.json(quote);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
