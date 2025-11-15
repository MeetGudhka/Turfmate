// Input validation using Joi
const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const result = schema.validate(req.body, { abortEarly: false });
  if (result.error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.details.map(d => d.message),
    });
  }
  next();
};

module.exports = { validate };