exports.validateSignupRequest = (req) => {
  const {
    name,
    fatherName,
    gender,
    dateOfBirth,
    religion,
    phoneNumber,
    userName,
    emailAddress,
    password,
    addressL1,
    addressL2,
    city,
    state,
    country,
    zipCode,
  } = req.body;

  if (!validateEmail(emailAddress)) {
    return {
      message: "Invalid email format",
      success: false,
    };
  }

  if (!validatePassword(password)) {
    return {
      message: "Invalid password format",
      success: false,
    };
  }

  if (
    !validateString(name) ||
    !validateString(fatherName) ||
    !validateString(gender) ||
    !validateString(dateOfBirth) ||
    !validateString(religion) ||
    !validateString(phoneNumber) ||
    !validateString(userName) ||
    !validateString(addressL1) ||
    !validateString(addressL2) ||
    !validateString(city) ||
    !validateString(state) ||
    !validateString(country) ||
    !validateString(zipCode)
  ) {
    return {
      message: "Invalid signup request",
      success: false,
    };
  }

  return { success: true };
};

exports.validateLoginRequest = (req) => {
  const { email, password, loginType } = req.body;

  if (!validatePassword(password)) {
    return {
      message: "Invalid password format",
      success: false,
    };
  }

  if (!validateEmail(email)) {
    return {
      message: "Invalid email format",
      success: false,
    };
  }

  if (!validateString(loginType)) {
    return {
      message: "Invalid login request",
      success: false,
    };
  }

  return { success: true };
};

exports.validateGetMediaRequest = (req) => {
  const { userId } = req.query;

  if (!validateString(userId)) {
    return {
      message: "Invalid get media request",
      success: false,
    };
  }

  return { success: true };
};

exports.validatePostHandleRequest = (req) => {
  const { userId, mediaIdArray, state } = req.body;

  if (
    !validateString(userId) ||
    !validateArray(mediaIdArray) ||
    !validateString(state)
  ) {
    return {
      message: "Invalid post handle request",
      success: false,
    };
  }

  return { success: true };
};

exports.validatePostStatusRequest = (req) => {
  const { mediaId, postStatus } = req.body;

  if (!validateString(mediaId) || !validateString(postStatus)) {
    return {
      message: "Invalid update post status request",
      success: false,
    };
  }

  return { success: true };
};

exports.validateLikeRequest = (req) => {
  const { userId, mediaId, likeStatus } = req.body;

  if (
    !validateString(userId) ||
    !validateString(mediaId) ||
    !validateString(likeStatus)
  ) {
    return {
      message: "Invalid like request",
      success: false,
    };
  }

  return { success: true };
};

exports.validateCommentRequest = (req) => {
  const { userId, mediaId, commentData } = req.body;

  if (
    !validateString(userId) ||
    !validateString(mediaId) ||
    !validateString(commentData)
  ) {
    return {
      message: "Invalid comment request",
      success: false,
    };
  }

  return { success: true };
};

exports.validateGetCommentRequest = (req) => {
  const { mediaId } = req.query;

  if (!validateString(mediaId)) {
    return {
      message: "Invalid getComments request",
      success: false,
    };
  }

  return { success: true };
};

exports.validateGetLikedPostsRequest = (req) => {
  const { userId } = req.query;

  if (!validateString(userId)) {
    return {
      message: "Please provide userId to get post liked",
      success: false,
    };
  }

  return { success: true };
};

exports.validateSignupRequest = (req) => {
  const {
    name,
    fatherName,
    gender,
    dateOfBirth,
    religion,
    phoneNumber,
    userName,
    emailAddress,
    password,
    addressL1,
    addressL2,
    city,
    state,
    country,
    zipCode,
  } = req.body;

  if (!validateEmail(emailAddress)) {
    return {
      message: "Invalid email format",
      success: false,
    };
  }

  if (!validatePassword(password)) {
    return {
      message: "Invalid password format",
      success: false,
    };
  }

  if (
    !validateString(name) ||
    !validateString(fatherName) ||
    !validateString(gender) ||
    !validateString(dateOfBirth) ||
    !validateString(religion) ||
    !validateString(phoneNumber) ||
    !validateString(userName) ||
    !validateString(addressL1) ||
    !validateString(addressL2) ||
    !validateString(city) ||
    !validateString(state) ||
    !validateString(country) ||
    !validateString(zipCode)
  ) {
    return {
      message: "Invalid signup request",
      success: false,
    };
  }

  return { success: true };
};

exports.validateLoginRequest = (req) => {
  const { email, password } = req.body;

  if (!validateEmail(email)) {
    return {
      message: "Invalid email format",
      success: false,
    };
  }

  if (!validatePassword(password)) {
    return {
      message: "Invalid password format",
      success: false,
    };
  }

  return { success: true };
};

exports.validateForgotPasswordRequest = (req) => {
  const isEmailValidated = validateEmail(req.body.email);

  if (!isEmailValidated) {
    return {
      message: "Invalid email format",
      success: false,
    };
  }

  return { success: true };
};

exports.validatePasswordChangeRequest = (req) => {
  const { email, password, confirmPassword } = req.body;

  if (!validateEmail(email)) {
    return {
      message: "Invalid email",
      success: false,
    };
  }

  if (!validatePassword(password) || !validatePassword(confirmPassword)) {
    return {
      message: "Invalid password format",
      success: false,
    };
  }

  if (password !== confirmPassword) {
    return {
      message: "Passwords mismatched",
      success: false,
    };
  }

  return { success: true };
};

exports.validateDeleteUserRequest = (req) => {
  const { userId, blockReason } = req.body;

  if (!validateString(userId) || !validateString(blockReason)) {
    return {
      message: "Invalid delete user request",
      success: false,
    };
  }

  return { success: true };
};

exports.validateChangeUserRoleRequest = (req) => {
  const { userId, userRole } = req.body;

  if (!validateString(userId) || !validateString(userRole)) {
    return {
      message: "Invalid change user request",
      success: false,
    };
  }

  return { success: true };
};

exports.validateDeletePostRequest = (req) => {
  const { mediaId } = req.body;

  if (!validateString(mediaId)) {
    return {
      message: "Invalid delete post request",
      success: false,
    };
  }

  return { success: true };
};

exports.validateCreateWebinarRequest = (req) => {
  const {
    agenda,
    startTime,
    adminUserId,
    duration,
    departmentName,
    meetingTopic,
    meetingType,
    host,
  } = req.body;

  const state = req.headers["state"];
  if (
    !validateString(agenda) ||
    !validateString(startTime) ||
    !validateString(adminUserId) ||
    !validateString(duration) ||
    !validateString(departmentName) ||
    !validateString(meetingTopic) ||
    !validateString(meetingType) ||
    !validateString(host)
  ) {
    return {
      success: false,
      message: "Invalid create meeting request",
    };
  }

  if (!validateString(state)) {
    return {
      success: false,
      message: "Invalid state in meeting request",
    };
  }

  return { success: true };
};

exports.validateGetWebinarInfoRequest = (req) => {
  const webinarId = req.query.webinarId;

  if (!validateString(webinarId)) {
    return {
      message: "Please provide valid webinarId",
      success: false,
    };
  }

  return { success: true };
};

exports.validategetJoinedUsersInformationRequest = (req) => {
  const webinarId = req.query.webinarId;

  if (!validateString(webinarId)) {
    return {
      message: "Please provide valid webinarId",
      success: false,
    };
  }

  return { success: true };
};

exports.validateDeleteWebinarRequest = (req) => {
  const webinarId = req.body.webinarId;

  if (!validateString(webinarId)) {
    return {
      message: "Please provide valid webinarId to delete",
      success: false,
    };
  }

  return { success: true };
};

exports.validateProfilePicRequest = (req) => {
  const { userId, mediaId } = req.body;

  if (!validateString(userId) || !validateString(mediaId)) {
    return {
      message: "Invalid profile pic request",
      success: false,
    };
  }

  return { success: true };
};

exports.validateAddParticipantJoinedFromPortalRequest = (req) => {
  const { userId, webinarId, timestamp, email } = req.body;

  if (
    !validateString(userId) ||
    !validateString(webinarId) ||
    !validateString(timestamp) ||
    !validateEmail(email)
  ) {
    return {
      success: false,
      message: "Invalid Request",
    };
  }

  return { success: true };
};

exports.validateVerifyAccountRequest = (req) => {
  const { token } = req.query;

  if (!validateString(token)) {
    return {
      message: "Please provide token",
      success: false,
    };
  }

  return { success: true };
};

exports.validateRegisterWebinarRequest = (req) => {
  const { webinarId, userId } = req.body;

  if (!validateString(webinarId) || !validateString(userId)) {
    return {
      message: "Invalid webinar register request",
      success: false,
    };
  }

  return { success: true };
};

exports.validateGetRegisteredUserRequest = (req) => {
  const webinarId = req.query.webinarId;

  if (!validateString(webinarId)) {
    return { success: false, message: "Please provide webinarId" };
  }

  return { success: true };
};

exports.validateChangeProfileRequest = (req) => {
  const { userId, name, userName } = req.body;

  if (
    !validateString(userId) ||
    !validateString(name) ||
    !validateString(userName)
  ) {
    return { success: false, message: "Invalid change profile request" };
  }
  return { success: true };
};

exports.validateStateProcessorRequest = (req) => {
  const state = req.headers["state"];

  if (!validateString(state)) {
    return { success: false };
  }

  return { success: true };
};

const validateArray = (arr) => {
  return (
    arr !== undefined &&
    arr !== null &&
    arr.length > 0 &&
    arr.every((ele) => validateString(ele))
  );
};

const validateString = (str) => {
  return str !== undefined && str !== null && String(str).trim().length > 0;
};

const validateEmail = (email) => {
  return (
    validateString(email) &&
    String(email)
      .toLowerCase()
      .trim()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  );
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  return validateString(password) && passwordRegex.test(String(password));
};
