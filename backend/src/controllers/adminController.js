/**
 * Admin Controller
 * Admin-specific operations: user management, system stats, etc.
 */

const User = require('../models/User');
const Prediction = require('../models/Prediction');
const logger = require('../config/logger');
const aiService = require('../services/aiService');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's prediction count
    const predictionCount = await Prediction.countDocuments({ user: user._id });

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        totalPredictions: predictionCount,
      },
    });
  } catch (error) {
    logger.error(`Get user by ID error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive, predictionLimit } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive !== 'undefined') user.isActive = isActive;
    if (predictionLimit) user.predictionLimit = predictionLimit;

    await user.save();

    logger.info(`Admin updated user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users',
      });
    }

    await user.deleteOne();

    logger.info(`Admin deleted user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get system statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getSystemStats = async (req, res, next) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ isActive: true });

    // Total predictions
    const totalPredictions = await Prediction.countDocuments();
    const successfulPredictions = await Prediction.countDocuments({ status: 'success' });
    const failedPredictions = await Prediction.countDocuments({ status: 'failed' });

    // Recent predictions
    const recentPredictions = await Prediction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    // Average prediction price
    const avgPredictionPrice = await Prediction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, avgPrice: { $avg: '$predictedPrice' } } },
    ]);

    // Model info
    const modelInfo = await aiService.getModelInfo();

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          active: activeUsers,
        },
        predictions: {
          total: totalPredictions,
          successful: successfulPredictions,
          failed: failedPredictions,
          avgPrice: avgPredictionPrice[0]?.avgPrice || 0,
        },
        recentPredictions,
        modelInfo,
      },
    });
  } catch (error) {
    logger.error(`Get system stats error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all predictions (admin view)
 * @route   GET /api/admin/predictions
 * @access  Private/Admin
 */
exports.getAllPredictions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = {};
    if (status) {
      query.status = status;
    }

    const predictions = await Prediction.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prediction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: predictions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: predictions,
    });
  } catch (error) {
    logger.error(`Get all predictions error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Create user
 * @route   POST /api/admin/users
 * @access  Private/Admin
 */
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, predictionLimit } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      predictionLimit: predictionLimit || 100,
    });

    logger.info(`Admin created new user: ${user.email} with role: ${user.role}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        predictionLimit: user.predictionLimit,
        predictionCount: user.predictionCount,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error(`Create user error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Create admin user
 * @route   POST /api/admin/create-admin
 * @access  Private/Admin
 */
exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });

    logger.info(`New admin created: ${admin.email}`);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    logger.error(`Create admin error: ${error.message}`);
    next(error);
  }
};
