export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for development
  console.error('❌ Error Interceptor: ', err);

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered.';
    error.status = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map((val) => val.message).join(', ');
    error.status = 400;
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Server encountered an unexpected error.'
  });
};

export default errorHandler;
