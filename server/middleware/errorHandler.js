import { error as errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  errorResponse(res, message, process.env.NODE_ENV === 'development' ? err : null, status);
};

export const notFound = (req, res) => {
  errorResponse(res, `Route not found: ${req.originalUrl}`, null, 404);
};
