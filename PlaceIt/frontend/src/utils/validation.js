/**
 * Utility functions for handling API errors and form validation
 */

/**
 * Format error messages from API responses or exceptions
 * @param {Error|Object} error - Error object or API response
 * @returns {String} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle API error responses
  if (error.message) {
    return error.message;
  }

  // Handle validation errors (array of errors)
  if (Array.isArray(error.errors)) {
    return error.errors.map(err => err.message).join(', ');
  }

  // Default fallback
  return 'An error occurred while processing your request';
};

/**
 * Validate if string is a valid email format
 * @param {String} email - Email to validate
 * @returns {Boolean} True if valid
 */
export const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} Validation result with isValid flag and message
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate phone number format
 * @param {String} phone - Phone number to validate
 * @returns {Boolean} True if valid
 */
export const isValidPhone = (phone) => {
  // Basic validation, can be enhanced for specific formats
  const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return !phone || re.test(String(phone));
};

/**
 * Truncate text with ellipsis
 * @param {String} text - Text to truncate
 * @param {Number} length - Max length
 * @returns {String} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text || text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};
