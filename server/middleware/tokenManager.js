const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set();

// Generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, user_name: user.user_name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' } // Longer-lived refresh token
  );
};

// Verify and decode token
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// Check if token is blacklisted
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// Blacklist token
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  
  // Clean up expired tokens periodically (basic implementation)
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 15 * 60 * 1000); // Remove after 15 minutes (access token expiry)
};

// Refresh token endpoint
const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(401).json({
        status: 'ERROR',
        success: false,
        message: 'Refresh token is required'
      });
    }

    if (isTokenBlacklisted(refresh_token)) {
      return res.status(401).json({
        status: 'ERROR',
        success: false,
        message: 'Token is blacklisted'
      });
    }

    const decoded = verifyToken(refresh_token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    if (!decoded || decoded.type !== 'refresh') {
      return res.status(401).json({
        status: 'ERROR',
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'ERROR',
        success: false,
        message: 'User not found'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Blacklist old refresh token
    blacklistToken(refresh_token);

    res.json({
      status: 'OK',
      success: true,
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Revoke token endpoint
const revokeToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Token is required'
      });
    }

    blacklistToken(token);

    res.json({
      status: 'OK',
      success: true,
      message: 'Token revoked successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  isTokenBlacklisted,
  blacklistToken,
  refreshToken,
  revokeToken
};