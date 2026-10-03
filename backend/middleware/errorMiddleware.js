const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('[API Error]:', err);

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `An account or record with that ${field} already exists.`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Resource not found with specified identifier.`;
    return res.status(404).json({ success: false, message });
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File is too large. Maximum size allowed is 10MB.' });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'An internal server error occurred. Please try again.',
  });
};

module.exports = { errorHandler };
