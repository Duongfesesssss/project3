// Custom error class
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = statusCode >= 400 && statusCode < 500 ? 'ERROR' : 'FAIL';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'ERROR';

  // Log error details
  console.error(`${new Date().toISOString()} - ${err.message}`);
  console.error(err.stack);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'ERROR',
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'ERROR',
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: 'ERROR',
      success: false,
      message: `${field} already exists`
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'ERROR',
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'ERROR',
      success: false,
      message: 'Token expired'
    });
  }

  // Default error response
  const response = {
    status: err.status,
    success: false,
    message: err.isOperational ? err.message : 'Internal server error'
  };

  // Don't expose error details in production
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(err.statusCode).json(response);
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { AppError, globalErrorHandler, asyncHandler };