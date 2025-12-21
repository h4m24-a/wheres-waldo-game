// 404 Error handler (catch-all for non-existent routes)

const notFound = (req, res, next) => {
  const error = new Error('not Found')    //  create a new Error object with the message 'Not Found'.
  error.status =  404;                // Assigned 404 status to the error. This indicates that the resource requested could not be found.
  next(error)                           // Pass the error to the next middleware (errorHandler)
}


module.exports = notFound;




// Catch all errors - on routes/endpoints that don't exist.
// Used as a catch-all for routes or endpoints that do not exist in your application.
// It creates a 404 Not Found error and passes it to the error-handling middleware via next().

// The next(error) forwards the error to the next middleware in the stack, will be the errorHandler.