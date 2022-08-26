const { BAD_REQUEST_RC } = require("../utils/ResponseCodes");
const {
  validateCreateWebinarRequest,
  validateGetWebinarInfoRequest,
  validateAddParticipantJoinedFromPortalRequest,
  validategetJoinedUsersInformationRequest,
  validateDeleteWebinarRequest,
  validateRegisterWebinarRequest,
  validateGetRegisteredUserRequest,
  validateStateProcessorRequest,
} = require("../utils/Validation");
const { getIpFromRequest } = require("../utils/Utility");

exports.creatWebinarRequestValidateMiddleware = (req, res, next) => {
  const validationResult = validateCreateWebinarRequest(req);

  if (!validationResult.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: validationResult.message,
      success: false,
      status: BAD_REQUEST_RC,
    });
  }

  req.meetingProps = {
    agenda: req.body.agenda,
    start_time: req.body.startTime,
    adminUserId: req.body.adminUserId,
    duration: req.body.duration,
    departmentName: req.body.departmentName,
    topic: req.body.meetingTopic,
    type: req.body.meetingType,
    timezone: "Asia/Kolkata",
    state: String(req.headers["state"]).toLowerCase(),
    host: req.body.host,
  };

  next();
};

exports.getWebinarInfoRequestMiddleware = (req, res, next) => {
  const validationResult = validateGetWebinarInfoRequest(req);

  if (!validationResult.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: validationResult.message,
      status: BAD_REQUEST_RC,
      success: false,
    });
  }

  next();
};

exports.addParticipantJoinedFromPortalRequestMiddleware = (req, res, next) => {
  const validationResult = validateAddParticipantJoinedFromPortalRequest(req);

  if (!validationResult.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: validationResult.message,
      status: BAD_REQUEST_RC,
    });
  }

  req.platformJoinedUserInfo = {
    webinarId: req.body.webinarId,
    userId: req.body.userId,
    email: req.body.email,
    timestamp: req.body.timestamp,
    ip: getIpFromRequest(req),
  };

  next();
};

exports.getJoinedUsersInformationRequestMiddleware = (req, res, next) => {
  const validationResult = validategetJoinedUsersInformationRequest(req);

  if (!validationResult.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: validationResult.message,
      status: BAD_REQUEST_RC,
      success: false,
    });
  }

  next();
};

exports.deleteWebinarRequestMiddleware = (req, res, next) => {
  const validateResult = validateDeleteWebinarRequest(req);

  if (!validateResult.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: validateResult.message,
      status: BAD_REQUEST_RC,
      success: false,
    });
  }

  next();
};

exports.registerParticipantRequestMiddleware = (req, res, next) => {
  const validateResult = validateRegisterWebinarRequest(req);

  if (!validateResult.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: validateResult.message,
      status: BAD_REQUEST_RC,
      success: false,
    });
  }

  req.body.userIp = getIpFromRequest(req);

  next();
};

exports.getRegisteredUsersRequestMiddleware = (req, res, next) => {
  const validateResult = validateGetRegisteredUserRequest(req);

  if (!validateResult.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: validateResult.message,
      status: BAD_REQUEST_RC,
      success: false,
    });
  }

  next();
};

exports.getRequestStateProcessorMiddleware = (req, res, next) => {
  const validate = validateStateProcessorRequest(req);

  if (!validate.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide valid state",
      success: false,
    });
  }

  req.body.state = String(req.headers["state"]).toLowerCase();

  next();
};
