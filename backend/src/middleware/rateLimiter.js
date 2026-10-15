const rateLimit = require('express-rate-limit');

// Strict limiter for authentication endpoints (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

// AI analysis rate limiter (protect Nebius Token Factory API quota)
const aiIncidentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // Limit each IP to 15 incident analyses per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI diagnostic requests submitted in a short period. Please wait a moment.'
  }
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded. Please slow down your requests.'
  }
});

module.exports = {
  authLimiter,
  aiIncidentLimiter,
  apiLimiter
};
