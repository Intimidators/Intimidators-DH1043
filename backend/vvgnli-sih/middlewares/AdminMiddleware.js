const { BAD_REQUEST_RC } = require("../utils/ResponseCodes");
const {
  validateDeleteUserRequest,
  validateChangeUserRoleRequest,
  validateDeletePostRequest,
} = require("../utils/Validation");

exports.deleteUserRequestValidationMiddleware = (req, res, next) => {
  const isDeleteUserRequestValidated = validateDeleteUserRequest(req);

  if (!isDeleteUserRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isDeleteUserRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

exports.changeUserRoleRequestValidationMiddleware = (req, res, next) => {
  const isChangeUserRoleRequestValidated = validateChangeUserRoleRequest(req);

  if (!isChangeUserRoleRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isChangeUserRoleRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

exports.deletePostRequestValidationMiddleware = (req, res, next) => {
  const isDeletePostRequestValidated = validateDeletePostRequest(req);

  if (!isDeletePostRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isDeletePostRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};
