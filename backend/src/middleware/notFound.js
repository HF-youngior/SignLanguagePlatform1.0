export const notFound = (req, res, next) => {
  const error = new Error(`未找到路由 - ${req.originalUrl}`);
  error.statusCode = 404;
  res.status(404);
  next(error);
};
