/**
 * Generic Zod request schema validation middleware
 */
const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Replace with validated/parsed values where appropriate
    if (validated.body) req.body = validated.body;
    if (validated.query) req.query = validated.query;
    if (validated.params) req.params = validated.params;
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join('.').replace(/^(body|query|params)\./, ''),
        message: err.message,
      }));
      return res.status(400).json({
        success: false,
        message: formattedErrors[0]?.message || 'Input validation failed',
        errors: formattedErrors,
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message || 'Validation error',
    });
  }
};

module.exports = validate;
