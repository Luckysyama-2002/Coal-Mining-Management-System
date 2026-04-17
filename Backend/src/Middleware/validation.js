const validator = require('validator');

// Middleware to sanitize request body
const sanitizeBody = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Trim whitespace and escape HTML
      return validator.escape(validator.trim(value));
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item =>
          typeof item === 'object' && item !== null ? sanitizeObject(item) : sanitizeValue(item)
        );
      } else {
        sanitized[key] = sanitizeValue(value);
      }
    }
    return sanitized;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  next();
};

// Middleware to validate and sanitize specific fields
const validateAndSanitize = (schema) => {
  return (req, res, next) => {
    const errors = [];

    const validateField = (field, rules, value) => {
      if (rules.required && (!value || value.toString().trim() === '')) {
        errors.push(`${field} is required`);
        return;
      }

      if (value && rules.type) {
        switch (rules.type) {
          case 'email':
            if (!validator.isEmail(value)) {
              errors.push(`${field} must be a valid email`);
            }
            break;
          case 'mobile':
            if (!/^[6-9]\d{9}$/.test(value)) {
              errors.push(`${field} must be a valid 10-digit mobile number`);
            }
            break;
          case 'aadhaar':
            if (!/^\d{12}$/.test(value)) {
              errors.push(`${field} must be exactly 12 digits`);
            }
            break;
          case 'pan':
            if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) {
              errors.push(`${field} must be a valid PAN format`);
            }
            break;
          case 'pincode':
            if (!/^\d{6}$/.test(value)) {
              errors.push(`${field} must be exactly 6 digits`);
            }
            break;
        }
      }

      if (value && rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      if (value && rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }
    };

    // Validate each field in the schema
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      validateField(field, rules, value);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors
      });
    }

    next();
  };
};

module.exports = {
  sanitizeBody,
  validateAndSanitize
};