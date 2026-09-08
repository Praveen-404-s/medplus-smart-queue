const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { getMongoStatus } = require('../config/db');
const { memoryAdmins } = require('../store/memoryStore');

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    let adminUser = null;

    if (getMongoStatus()) {
      adminUser = await Admin.findOne({ email: email.toLowerCase() });
    } else {
      adminUser = memoryAdmins.find(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      );
    }

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Check email and password.',
      });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Check email and password.',
      });
    }

    const jwtSecret =
      process.env.JWT_SECRET || 'praveen_portfolio_jwt_secret_key_2026_super_secure';

    const token = jwt.sign(
      { id: adminUser._id || adminUser.id, email: adminUser.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        email: adminUser.email,
        id: adminUser._id || adminUser.id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login authentication',
      error: error.message,
    });
  }
};

// @desc    Get current admin info from token
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    admin: req.admin,
  });
};

module.exports = { loginAdmin, getMe };
