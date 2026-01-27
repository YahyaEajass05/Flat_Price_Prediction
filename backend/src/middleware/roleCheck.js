/**
 * Role-Based Access Control Middleware
 * Restricts access based on user roles
 */

const logger = require('../config/logger');

/**
 * Grant access to specific roles
 * @param  {...string} roles - Allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login first.',
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user._id} with role ${req.user.role}`);
      
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

/**
 * Admin only access
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.',
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn(`Admin-only route accessed by non-admin user: ${req.user._id}`);
    
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }

  next();
};

/**
 * Check if user owns the resource or is admin
 */
exports.ownerOrAdmin = (resourceUserIdField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login first.',
      });
    }

    // Admin has access to everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req[resourceUserIdField] || req.params[resourceUserIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ownership could not be determined',
      });
    }

    if (req.user._id.toString() !== resourceUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource',
      });
    }

    next();
  };
};

/**
 * Check prediction limits for users
 */
exports.checkPredictionLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login first.',
      });
    }

    // Admin has unlimited predictions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has reached prediction limit
    if (!req.user.canMakePrediction || !req.user.canMakePrediction()) {
      const remaining = req.user.predictionLimit - req.user.predictionCount;
      
      return res.status(429).json({
        success: false,
        message: `Prediction limit reached. You have used ${req.user.predictionCount} out of ${req.user.predictionLimit} predictions.`,
        data: {
          used: req.user.predictionCount,
          limit: req.user.predictionLimit,
          remaining: Math.max(0, remaining),
        },
      });
    }

    next();
  } catch (error) {
    logger.error(`Prediction limit check error: ${error.message}`);
    next(error);
  }
};
