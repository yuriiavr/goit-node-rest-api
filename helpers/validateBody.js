import HttpError from "./HttpError.js";

const validateBody = (schema) => {
  return (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(HttpError(400, "Missing fields"));
    }

    const { error } = schema.validate(req.body);
    if (error) {
      return next(HttpError(400, error.message));
    }
    next();
  };
};

export default validateBody;