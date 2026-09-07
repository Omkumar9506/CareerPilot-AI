/**
 * Higher-order function to wrap async Express routes and automatically forward exceptions to next().
 * @param {Function} requestHandler - Async express request handler
 * @returns {Function} Express middleware handler
 */
export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
