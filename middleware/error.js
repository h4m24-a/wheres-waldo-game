// Error handler middleware
const errorHandler = (err, req, res, next) => {

  // If the error has a status code, use it; otherwise default to 500
  const statusCode = err.status || 500;

  // Set a default message if there's no message in the error
  const message = err.message || 'Internal Server Error';

  // Check if status is 404 and handle it separately, otherwise use generic error
  const errorType = statusCode === 404 ? 'Not Found' : 'Error';

  // Send the response with the correct status code and message
  res.status(statusCode).json({
    error: errorType,
    message: statusCode === 404
      ? 'The requested resource could not be found'
      : message,
  });
};

module.exports = errorHandler;
