function errorHandler(err, req, res, next) {
  // Never expose sensitive internal stack traces or keys to the client
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error message safely without secrets
  console.error(`[OpsCopilot Error] [${req.method} ${req.url}]:`, err.message);
  if (!isProduction && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    ...(isProduction ? {} : { stack: err.stack })
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
