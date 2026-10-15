const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Register new user
async function register(req, res, next) {
  try {
    const { name, email, password, role = 'sre_engineer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = User.create({
      name,
      email,
      password_hash,
      role
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

// Login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

// Demo quick-login (provisions or fetches demo SRE profile for 1-click test)
async function demoLogin(req, res, next) {
  try {
    const demoEmail = 'alex.chen@opscopilot.io';
    let user = User.findByEmail(demoEmail);

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash('DemoSRE2026!', salt);
      user = User.create({
        name: 'Alex Chen (Staff SRE)',
        email: demoEmail,
        password_hash,
        role: 'lead_sre'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Demo SRE profile loaded successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get current user profile
function getMe(req, res) {
  return res.json({
    success: true,
    user: req.user
  });
}

module.exports = {
  register,
  login,
  demoLogin,
  getMe
};
