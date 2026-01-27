/**
 * Request Validation Middleware
 * Using express-validator for input validation
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  next();
};

/**
 * User registration validation
 */
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
];

/**
 * Login validation
 */
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
];

/**
 * Property prediction validation
 */
exports.predictionValidation = [
  body('kitchen_area').isFloat({ min: 0, max: 100 }).withMessage('Kitchen area must be between 0 and 100'),
  body('bath_area').isFloat({ min: 0, max: 100 }).withMessage('Bath area must be between 0 and 100'),
  body('other_area').isFloat({ min: 0, max: 500 }).withMessage('Other area must be between 0 and 500'),
  body('total_area').isFloat({ min: 10, max: 500 }).withMessage('Total area must be between 10 and 500'),
  body('rooms_count').isInt({ min: 0, max: 10 }).withMessage('Rooms count must be between 0 and 10'),
  body('bath_count').isInt({ min: 1, max: 5 }).withMessage('Bath count must be between 1 and 5'),
  body('floor').isInt({ min: 1, max: 100 }).withMessage('Floor must be between 1 and 100'),
  body('floor_max').isInt({ min: 1, max: 100 }).withMessage('Max floor must be between 1 and 100'),
  body('ceil_height').isFloat({ min: 1.5, max: 6.0 }).withMessage('Ceiling height must be between 1.5 and 6.0'),
  body('year').isInt({ min: 1800, max: 2025 }).withMessage('Year must be between 1800 and 2025'),
  body('gas').isIn(['Yes', 'No']).withMessage('Gas must be Yes or No'),
  body('hot_water').isIn(['Yes', 'No']).withMessage('Hot water must be Yes or No'),
  body('central_heating').isIn(['Yes', 'No']).withMessage('Central heating must be Yes or No'),
  body('district_name').notEmpty().withMessage('District name is required'),
  body('extra_area').isFloat({ min: 0 }).withMessage('Extra area must be 0 or greater'),
  body('extra_area_count').isInt({ min: 0 }).withMessage('Extra area count must be 0 or greater'),
  body('extra_area_type_name').notEmpty().withMessage('Extra area type is required'),
];

/**
 * Update profile validation
 */
exports.updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
];

/**
 * Change password validation
 */
exports.changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

/**
 * MongoDB ObjectId validation
 */
exports.objectIdValidation = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage('Invalid ID format'),
];

/**
 * Pagination validation
 */
exports.paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];
