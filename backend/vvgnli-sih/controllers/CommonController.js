const {
  INSERT_ADDRESS_DETAILS_QUERY,
  INSERT_USER_DETAILS_QUERY,
  FIND_USER_BY_EMAIL_QUERY,
  PASSWORD_UPDATE_QUERY,
  FIND_USER_BY_USER_ID_IN_PROFILE_TABLE_QUERY,
  INSERT_PROFILE_DETAILS_QUERY,
  UPDATE_PROFILE_DETAILS_QUERY,
  FETCH_PROFILE_PIC_QUERY,
  INSERT_UPDATED_LOGIN_IPS_QUERY,
  FIND_ADDRESS_DETAILS_QUERY,
  FIND_USER_BY_USERID_QUERY,
  UPDATE_ACCOUNT_VERIFICATION_QUERY,
  CHANGE_PROFILE_QUERY,
  FIND_MEDIA_URL_QUERY,
} = require("../configs/databaseConfig/DatabaseQueries");
const { makeDbCall } = require("../utils/DatabaseCalls");
const {
  CREATED_RC,
  OK_RC,
  BAD_REQUEST_RC,
  INTERNAL_SERVER_ERROR_RC,
  UNAUTHORIZED_RC,
  CONFLICT_RC,
  NOT_FOUND_RC,
} = require("../utils/ResponseCodes");
const {
  generateHashedPassword,
  checkPassword,
  generateRandomPassword,
} = require("../utils/PasswordUtils");
const {
  sendAccountCreateSuccessEmail,
  sendForgotPasswordEmail,
  sendPasswordChangedSuccessEmail,
} = require("../utils/EmailSender");
const {
  getIpFromRequest,
  getServerBaseIP,
  encodeToBase64,
  decodeBase64,
} = require("../utils/Utility");
const crypto = require("crypto");
const { putLog } = require("../utils/LogUtils");

// signup controller method
exports.Signup = async (req, res) => {
  const addressDetails = req.addressDetails;
  const userDetails = req.userDetails;
  const addressId = generateRandomId();
  const userId = generateRandomId();
  const ip = userDetails[userDetails.length - 1];
  putLog(userId, `Signup request received from ${ip}}`);

  const fetchUserByEmailQuery = await makeDbCall(FIND_USER_BY_EMAIL_QUERY, [
    req.body.emailAddress,
  ]);

  if (!fetchUserByEmailQuery) {
    return res.status(INTERNAL_SERVER_ERROR_RC).json({
      message: "Internal server error",
      status: INTERNAL_SERVER_ERROR_RC,
      success: false,
    });
  }

  const user = fetchUserByEmailQuery.response[0][0];

  // if user is not null/undefined, then either it is blocked or already exists
  if (user) {
    const isDeleted = user.isDeleted[0];

    if (isDeleted === 1) {
      return res.status(UNAUTHORIZED_RC).json({
        message: `You account is blocked`,
        reason: user.blockReason,
        success: false,
        timestamp: Date.now(),
      });
    } else {
      return res.status(CONFLICT_RC).json({
        message: `Account already exists with ${req.body.emailAddress}`,
        success: false,
        status: CONFLICT_RC,
      });
    }
  }

  const insertAddressQueryResult = await makeDbCall(
    INSERT_ADDRESS_DETAILS_QUERY,
    [addressId, ...addressDetails]
  );

  if (!insertAddressQueryResult.success) {
    makeDbCall(DELETE_ENTRY_FROM_ADDRESS_DETAILS_QUERY, [addressId]);

    return res.status(insertAddressQueryResult.status).json({
      message: insertAddressQueryResult.message,
      success: false,
      message: insertAddressQueryResult.message,
    });
  }

  const insertUserQueryResult = await makeDbCall(INSERT_USER_DETAILS_QUERY, [
    userId,
    ...userDetails,
    addressId,
    generateHashedPassword(req.body.password),
    req.body.state,
  ]);

  if (!insertUserQueryResult.success) {
    return res.status(insertUserQueryResult.status).json({
      success: false,
      statusL: insertUserQueryResult.status,
      message: insertUserQueryResult.message,
    });
  }

  sendAccountCreateSuccessEmail(
    req.body.name,
    req.body.emailAddress,
    getAccountVerificationUrl(req, userId)
  );

  return res.status(CREATED_RC).json({
    message: `User account created successfully`,
    success: true,
  });
};

// login controller method
exports.Login = async (req, res) => {
  const { email, password } = req.body;

  const fetchUserByEmailQuery = await makeDbCall(FIND_USER_BY_EMAIL_QUERY, [
    email,
  ]);

  if (!fetchUserByEmailQuery.success) {
    return res.status(fetchUserByEmailQuery.status).json({
      message: fetchUserByEmailQuery.message,
      success: false,
      timestamp: Date.now(),
    });
  }

  const user = fetchUserByEmailQuery.response[0][0];

  // if user not exists or password mismatches
  if (!user || !checkPassword(password, user?.password)) {
    return res.status(NOT_FOUND_RC).json({
      message: "Invalid credentials",
      success: false,
    });
  }

  // check if user account is deleted or not
  if (user.isDeleted[0] === 1) {
    return res.status(UNAUTHORIZED_RC).json({
      message: `You account has been blocked. Reason: ${user.blockReason}`,
      success: false,
      timestamp: Date.now(),
    });
  }

  if (!user.isVerified) {
    return res.status(UNAUTHORIZED_RC).json({
      message: "Please verify your account to continue",
      success: false,
    });
  }

  let parsedLoggedInIp = getParsedLoggedInUserIp(req);

  putLog(
    user.userId,
    `Login request received for ${email} from ${parsedLoggedInIp}`
  );

  if (!user.loginIps) {
    user.loginIps = parsedLoggedInIp;
  } else {
    let loginIps = user.loginIps;
    let loginIpArray = loginIps.split(",");

    if (loginIpArray.length === 5) {
      loginIpArray.shift();
    }

    loginIpArray.push(parsedLoggedInIp);
    loginIps = loginIpArray.toString();

    user.loginIps = loginIps;
  }

  if (user.isTempPassword) {
    const expiresInMinutes = process.env.TEMP_PASS_EXPIRES_IN || 10;
    const passwordExpirationTime = user.tpIssuedAt + expiresInMinutes * 60000;

    if (passwordExpirationTime < Date.now()) {
      return res.status(BAD_REQUEST_RC).json({
        message: "Your temporary password is expired. Please generate again",
        success: false,
        timestamp: Date.now(),
      });
    }
  }

  const fetchProfilePicQuery = await makeDbCall(FETCH_PROFILE_PIC_QUERY, [
    user.userId,
  ]);

  let mediaURL = "";

  if (fetchProfilePicQuery.response[0]?.length > 0) {
    mediaURL = fetchProfilePicQuery.response[0][0].mediaURL;
  }

  const fetchAddressDetailsQueryResult = await makeDbCall(
    FIND_ADDRESS_DETAILS_QUERY,
    [user.addressId]
  );

  const addressDetails = fetchAddressDetailsQueryResult.response[0][0];

  makeDbCall(INSERT_UPDATED_LOGIN_IPS_QUERY, [
    user.loginIps,
    user.emailAddress,
  ]);

  res.status(OK_RC).json({
    message: "Login successful",
    user: {
      userId: user.userId,
      name: user.name,
      fatherName: user.fatherName,
      username: user.userName,
      email: user.emailAddress,
      role: user.userRole,
      isTempPassword: user.isTempPassword,
      gender: user.gender,
      DOB: user.dateOfBirth,
      religion: user.religion,
      phoneNumber: user.phoneNumber,
      addressL1: addressDetails?.addressL1,
      addressL2: addressDetails?.addressL2,
      city: addressDetails?.city,
      state: user?.state,
      country: addressDetails?.country,
      zipCode: addressDetails?.zipCode,
    },
    profilePicURL: mediaURL,
    success: true,
  });
};

// verify account controller method
exports.VerifyAccount = async (req, res) => {
  const token = req.verificationToken;
  const userId = decodeBase64(token);

  const user = await findUserByUserId(userId);

  if (!user) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Invalid token",
      status: BAD_REQUEST_RC,
      success: false,
    });
  }

  if (user.isVerified === 1) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Token expired, account already activated",
      status: BAD_REQUEST_RC,
      success: false,
    });
  }

  const result = await makeDbCall(UPDATE_ACCOUNT_VERIFICATION_QUERY, [
    true,
    userId,
    user.emailAddress,
  ]);

  if (!result.success) {
    return res.status(INTERNAL_SERVER_ERROR_RC).json({
      message: "Internal server error",
      status: INTERNAL_SERVER_ERROR_RC,
      success: false,
    });
  }

  const verificationUpdateResult = result.response[0]?.affectedRows === 1;

  return res.status(verificationUpdateResult ? 200 : 500).json({
    message: verificationUpdateResult
      ? "Account activated successfully"
      : "Error activating account",
    success: verificationUpdateResult,
  });
};

// Forgot Password method
exports.ForgotPassword = async (req, res) => {
  const { email } = req.body;

  const findUserByEmailResult = await makeDbCall(FIND_USER_BY_EMAIL_QUERY, [
    email,
  ]);

  if (!findUserByEmailResult.success) {
    return res.status(findUserByEmailResult.status).json({
      message:
        "Error in forgot password request, check your email and try again",
      success: false,
      timestamp: Date.now(),
    });
  }

  const user = findUserByEmailResult.response[0][0];

  if (!user) {
    return res.status(BAD_REQUEST_RC).json({
      message: `No account found with emailId: ${email}`,
      success: false,
      timestamp: Date.now(),
    });
  }

  const _tempPassword = generateRandomPassword();
  const temporaryPassword = generateHashedPassword(_tempPassword);
  const expiredInMinutes = process.env.TEMP_PASS_EXPIRES_IN || 10;
  const temporaryPasswordIssuedAt = Date.now();

  const tempPasswordUpdateQueryResponse = await makeDbCall(
    PASSWORD_UPDATE_QUERY,
    [
      temporaryPassword,
      true,
      temporaryPasswordIssuedAt,
      user.emailAddress,
      user.userId,
    ]
  );

  if (!tempPasswordUpdateQueryResponse.success) {
    return res.status(INTERNAL_SERVER_ERROR_RC).json({
      message: tempPasswordUpdateQueryResponse.message,
      success: tempPasswordUpdateQueryResponse.status,
      timestamp: Date.now(),
    });
  }

  // send email to user with temporary password
  const sendForgotPasswordEmailResponse = await sendForgotPasswordEmail(
    user.emailAddress,
    _tempPassword,
    expiredInMinutes
  );

  return res.status(sendForgotPasswordEmailResponse.status).json({
    message: sendForgotPasswordEmailResponse.message,
    success: sendForgotPasswordEmailResponse.success,
    status: sendForgotPasswordEmailResponse.status,
  });
};

// Update Password method
exports.ProcessPasswordUpdate = async (req, res) => {
  const { email, password } = req.body;

  const findUserByEmailResult = await makeDbCall(FIND_USER_BY_EMAIL_QUERY, [
    email,
  ]);

  if (!findUserByEmailResult.success) {
    return res.status(findUserByEmailResult.status).json({
      message: findUserByEmailResult.message,
      success: false,
      timestamp: Date.now(),
    });
  }

  const user = findUserByEmailResult.response[0][0];

  if (!user) {
    return res.status(BAD_REQUEST_RC).json({
      message: `No user found with emailId: ${email}`,
      success: false,
      timestamp: Date.now(),
    });
  }

  const passwordUpdateQueryResponse = await makeDbCall(PASSWORD_UPDATE_QUERY, [
    generateHashedPassword(password),
    false,
    0,
    user.emailAddress,
    user.userId,
  ]);

  if (!passwordUpdateQueryResponse.success) {
    return res.status(passwordUpdateQueryResponse.status).json({
      message: passwordUpdateQueryResponse.message,
      success: passwordUpdateQueryResponse.status,
      timestamp: Date.now(),
    });
  }

  sendPasswordChangedSuccessEmail(user.emailAddress);

  return res.status(OK_RC).json({
    message: "Password updated successfully",
    success: true,
    status: OK_RC,
  });
};

exports.HandleProfilePic = async (req, res) => {
  const { userId, mediaId } = req.body;

  const findUserQueryResult = await makeDbCall(
    FIND_USER_BY_USER_ID_IN_PROFILE_TABLE_QUERY,
    [userId]
  );

  if (!findUserQueryResult.success) {
    return res.status(findUserQueryResult.status).json({
      message: findUserQueryResult.message,
      success: false,
      timestamp: Date.now(),
    });
  }

  let profilePicQueryResult;

  if (findUserQueryResult.response[0].length > 0) {
    // update the profile pic
    profilePicQueryResult = await makeDbCall(UPDATE_PROFILE_DETAILS_QUERY, [
      mediaId,
      userId,
    ]);
  } else {
    // insert the user with profile pic
    profilePicQueryResult = await makeDbCall(INSERT_PROFILE_DETAILS_QUERY, [
      userId,
      mediaId,
    ]);
  }

  const findMediaURLQueryResult = await makeDbCall(FIND_MEDIA_URL_QUERY, [
    mediaId,
  ]);

  if (!findMediaURLQueryResult.success) {
    return res.status(findMediaURLQueryResult.status).json({
      message: findMediaURLQueryResult.message,
      success: false,
      timestamp: Date.now(),
    });
  }

  if (!profilePicQueryResult.success) {
    return res.status(profilePicQueryResult.status).json({
      message: profilePicQueryResult.message,
      success: false,
      timestamp: Date.now(),
    });
  }

  return res.status(OK_RC).json({
    message: "successfully done",
    success: true,
    mediaURL: findMediaURLQueryResult.response[0][0].mediaURL,
    status: OK_RC,
  });
};

exports.ChangeProfile = async (req, res) => {
  const { userId, name, userName } = req.body;

  const changeProfileQueryResult = await makeDbCall(CHANGE_PROFILE_QUERY, [
    name,
    userName,
    userId,
  ]);

  if (!changeProfileQueryResult.success) {
    return res.status(changeProfileQueryResult.status).json({
      message: changeProfileQueryResult.message,
      success: false,
      timestamp: Date.now(),
    });
  }

  return res.status(OK_RC).json({
    message: "successfully done",
    success: true,
    status: OK_RC,
  });
};

// method to generate random id of 16 bytes in size
const generateRandomId = () => {
  return crypto.randomBytes(8).toString("hex");
};

// method to get parsed IP of loggedIn user based on prod/dev env
const getParsedLoggedInUserIp = (req) => {
  if (process.env.NODE_ENV === "production") {
    return String(getIpFromRequest(req));
  } else {
    return "127.0.0.1";
  }
};

const getAccountVerificationUrl = (req, userId) => {
  const url = String(getServerBaseIP(req));
  const encodedUserId = encodeToBase64(userId);

  return `${url}/api/vvgnli/v1/verifyAccount?token=${encodedUserId}`;
};

const findUserByUserId = async (userId) => {
  try {
    const findUserByUserIdQueryResult = await makeDbCall(
      FIND_USER_BY_USERID_QUERY,
      [userId]
    );

    if (
      !findUserByUserIdQueryResult.success ||
      !findUserByUserIdQueryResult.response[0][0]
    ) {
      return null;
    }

    return findUserByUserIdQueryResult.response[0][0];
  } catch (err) {
    return null;
  }
};
