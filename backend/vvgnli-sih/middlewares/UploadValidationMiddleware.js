const { BAD_REQUEST_RC } = require("../utils/ResponseCodes");
const { validateFileUploadRequest, validateResearchWorkRequest } = require("../utils/ValidateMedia");

exports.uploadRequestValidatorMiddleware = (req, res, next) => {
  const isFileRequestValidated = validateFileUploadRequest(req);

  // if request is invalid then return error response
  if (!isFileRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isFileRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

exports.uploadResearchWorkValidatorMiddleware = (req, res, next) => {
  const isResearchWorkRequestValidated = validateResearchWorkRequest(req);

  if (!isResearchWorkRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isResearchWorkRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
}
