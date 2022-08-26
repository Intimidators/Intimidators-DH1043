exports.PutRequestValidationMiddleware = (req, res, next) => {
  const { userId, data } = req.body;

  if (!validate(userId)) {
    return res.status(400).json({
      message: "Invalid userId in PUT request",
      succes: false,
      timestamp: Date.now,
    });
  }

  if (!validate(data)) {
    return res.status(400).json({
      message: "Invalid data in PUT request",
      succes: false,
      timestamp: Date.now,
    });
  }

  next();
};

exports.GetRequestValidationMiddleware = (req, res, next) => {
  const { userId } = req.query;

  if (!validate(userId)) {
    return res.status(400).json({
      message: "Invalid userId in GET request",
      succes: false,
      timestamp: Date.now,
    });
  }

  next();
};

const validate = (data) => {
  return data !== null && data !== undefined && String(data).trim().length > 10;
};
