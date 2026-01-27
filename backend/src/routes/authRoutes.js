/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  validate,
} = require('../middleware/validation');

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/me', getMe);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.put('/change-password', changePasswordValidation, validate, changePassword);
router.post('/logout', logout);

module.exports = router;
