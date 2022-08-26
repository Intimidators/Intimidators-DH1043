const { BAD_REQUEST_RC } = require("../utils/ResponseCodes");
const {
  validatePostHandleRequest,
  validatePostStatusRequest,
  validateLikeRequest,
  validateCommentRequest,
  validateGetCommentRequest,
  validateGetLikedPostsRequest,
  validateGetMediaRequest,
} = require("../utils/Validation");

exports.postHandleRequestValidatorMiddleware = (req, res, next) => {
  req.body.state = getState(req);
  const isPostHandleRequestValidated = validatePostHandleRequest(req);

  if (!isPostHandleRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isPostHandleRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

exports.updatePostStatusRequestValidatorMiddleware = (req, res, next) => {
  const isUpdatePostStatusRequestValidated = validatePostStatusRequest(req);

  if (!isUpdatePostStatusRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isUpdatePostStatusRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

exports.likeRequestValidatorMiddleware = (req, res, next) => {
  const isLikeRequestValidated = validateLikeRequest(req);

  if (!isLikeRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isLikeRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

exports.commentRequestValidatorMiddleware = (req, res, next) => {
  const isCommentRequestValidated = validateCommentRequest(req);

  if (!isCommentRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isCommentRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

exports.getCommentRequestValidatorMiddleware = (req, res, next) => {
  const isGetCommentRequestValidated = validateGetCommentRequest(req);

  if (!isGetCommentRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isGetCommentRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

exports.getLikedPostsRequestValidatorMiddleware = (req, res, next) => {
  const isGetLikedPostsRequestValidated = validateGetLikedPostsRequest(req);

  if (!isGetLikedPostsRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isGetLikedPostsRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

exports.getMediaForUserIdRequestValidatorMiddleware = (req, res, next) => {
  const isGetMediaRequestValidated = validateGetMediaRequest(req);

  if (!isGetMediaRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isGetMediaRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

const getState = (req) => {
  return req.headers["state"];
};
