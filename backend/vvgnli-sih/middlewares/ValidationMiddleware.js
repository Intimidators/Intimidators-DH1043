const { BAD_REQUEST_RC } = require("../utils/ResponseCodes");
const {
  validateSignupRequest,
  validateLoginRequest,
  validateForgotPasswordRequest,
  validatePasswordChangeRequest,
  validateProfilePicRequest,
  validateVerifyAccountRequest,
  validateChangeProfileRequest,
} = require("../utils/Validation");
const { getIpFromRequest } = require("../utils/Utility");

exports.profilePicRequestValidatorMiddleware = (req, res, next) => {
  const isProfilePicRequestValidated = validateProfilePicRequest(req);

  if (!isProfilePicRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isProfilePicRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }
  next();
};

exports.changeProfileRequestValidatorMiddleware = (req, res, next) => {
  const isChangeProfileRequestValidated = validateChangeProfileRequest(req);

  if (!isChangeProfileRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isChangeProfileRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }
  next();
};

exports.signupRequestValidatorMiddleware = (req, res, next) => {
  const isSignupRequestValidated = validateSignupRequest(req);

  // if request is invalid then return error response
  if (!isSignupRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isSignupRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  req.addressDetails = [
    req.body.addressL1,
    req.body.addressL2,
    req.body.city,
    req.body.country,
    req.body.zipCode,
  ];

  const loggedInIp = getIpFromRequest(req);
  let parsedLoggedInIp;
  if (process.env.NODE_ENV === "production") {
    parsedLoggedInIp = loggedInIp.slice(7);
  } else {
    parsedLoggedInIp = "127.0.0.1";
  }

  req.userDetails = [
    req.body.name,
    req.body.fatherName,
    req.body.gender,
    req.body.dateOfBirth,
    req.body.religion,
    req.body.phoneNumber,
    req.body.userName,
    req.body.emailAddress,
    parsedLoggedInIp,
  ];

  // if next() executes then only request will be delegated to next middleware (in this case, controller method)
  next(); // it's important and must to call next() otherwise boom
};

exports.loginRequestValidatorMiddleware = (req, res, next) => {
  const isLoginRequestValidated = validateLoginRequest(req);

  if (!isLoginRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isLoginRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

exports.forgotPasswordRequestValidatorMiddleware = (req, res, next) => {
  const isForgotPasswordRequestValidated = validateForgotPasswordRequest(req);

  if (!isForgotPasswordRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isForgotPasswordRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

exports.passwordChangeRequestValidatorMiddleware = (req, res, next) => {
  const isPasswordChangeRequestValidated = validatePasswordChangeRequest(req);

  if (!isPasswordChangeRequestValidated.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: isPasswordChangeRequestValidated.message,
      status: BAD_REQUEST_RC,
    });
  }

  next();
};

exports.verifyAccountRequestValidatorMiddleware = (req, res, next) => {
  const validationResult = validateVerifyAccountRequest(req);

  if (!validationResult.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: validationResult.message,
      success: false,
      status: BAD_REQUEST_RC,
    });
  }

  req.verificationToken = req.query.token;

  next();
};

const getState = (req) => {
  return req.headers["state"];
};
