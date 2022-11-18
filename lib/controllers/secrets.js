const { Router } = require('express');
const Secret = require('../models/Secrets');
const authenticate = require('../middleware/authenticate');

module.exports = Router().get('/', [authenticate], async (req, res, next) => {
  try {
    const secrets = await Secret.getAll();
    res.send(secrets);
  } catch (error) {
    next(error);
  }
});
