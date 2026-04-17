/**
 * Validation Middleware
 * 
 * Simple request body validation without external libraries.
 * Uses a schema object to define required fields and their types.
 * 
 * USAGE:
 *   const schema = {
 *     email: { type: 'string', required: true },
 *     password: { type: 'string', required: true, minLength: 6 }
 *   };
 *   router.post('/login', validate(schema), loginHandler);
 * 
 * @param {Object} schema - Validation rules for request body fields
 * @returns {Function} Express middleware function
 */

const { ErrorFactory } = require('../utils/factory');

const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const body = req.body;

    // Check each field defined in the schema
    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];

      // Check if required field is missing
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;  // Skip further checks for this field
      }

      // If field is optional and not provided, skip validation
      if (value === undefined || value === null) {
        continue;
      }

      // Check type
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be a ${rules.type}`);
      }

      // Check minimum length (for strings)
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      // Check maximum length (for strings)
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }

      // Check enum values
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
    }

    // If there are validation errors, reject the request
    if (errors.length > 0) {
      return next(ErrorFactory.badRequest(`Validation failed: ${errors.join('; ')}`));
    }

    // All validations passed
    next();
  };
};

module.exports = validate;
