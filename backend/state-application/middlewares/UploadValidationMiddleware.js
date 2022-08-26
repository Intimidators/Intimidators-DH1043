const { validateFileUploadRequest } = require("../utils/ValidateMedia");

exports.uploadRequestValidatorMiddleware = (req, res, next) => {
  const isFileRequestValidated = validateFileUploadRequest(req);

  // if request is invalid then return error response
  if (!isFileRequestValidated.success) {
    return res.status(400).json({
      message: isFileRequestValidated.message,
      status: 400,
    });
  }

  next();
};
