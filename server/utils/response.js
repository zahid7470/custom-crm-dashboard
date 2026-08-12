export const success = (res, message, data = {}, status = 200) => {
  res.status(status).json({ success: true, message, data });
};

export const error = (res, message, err = null, status = 500) => {
  const payload = { success: false, message };
  if (err && process.env.NODE_ENV !== 'production') payload.error = err;
  res.status(status).json(payload);
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
