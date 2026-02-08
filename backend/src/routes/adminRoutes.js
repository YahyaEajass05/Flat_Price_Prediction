/**
 * Admin Routes
 * Admin-only routes for user management and system administration
 */

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getSystemStats,
  getAllPredictions,
  createAdmin,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleCheck');
const { objectIdValidation, paginationValidation, validate } = require('../middleware/validation');

// Protect all admin routes
router.use(protect);
router.use(adminOnly);

// User management
router.get('/users', paginationValidation, validate, getAllUsers);
router.post('/users', createUser);
router.get('/users/:id', objectIdValidation('id'), validate, getUserById);
router.put('/users/:id', objectIdValidation('id'), validate, updateUser);
router.delete('/users/:id', objectIdValidation('id'), validate, deleteUser);

// System statistics
router.get('/stats', getSystemStats);

// Prediction management
router.get('/predictions', paginationValidation, validate, getAllPredictions);

// Admin creation
router.post('/create-admin', createAdmin);

module.exports = router;
