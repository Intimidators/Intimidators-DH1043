const {
  FIND_USER_BY_USERID_QUERY,
} = require("../configs/databaseConfig/DatabaseQueries");
const { makeDbCall } = require("../utils/DatabaseCalls");
const {
  BAD_REQUEST_RC,
  UNAUTHORIZED_RC,
  NOT_FOUND_RC,
} = require("../utils/ResponseCodes");

const ADMIN_ROLE = 1;
const USER_ROLE = 2;

exports.isUserAdmin = async (req, res, next) => {
  const userId = getAuthUserId(req);

  if (!verifyUserId(userId)) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide userId",
      status: BAD_REQUEST_RC,
    });
  }

  const userQueryResponse = await fetchUserByUserId(userId);

  if (!userQueryResponse) {
    return res.status(200).json({
      message: "Something went wrong, try again",
    });
  }

  if (!userQueryResponse.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: userQueryResponse.message,
      success: false,
      timestamp: Date.now(),
    });
  }

  const user = userQueryResponse.response[0][0];

  if (!user) {
    return res.status(NOT_FOUND_RC).json({
      message: `Invalid auth userId`,
      success: false,
    });
  }

  if (user.userRole !== ADMIN_ROLE) {
    return res.status(UNAUTHORIZED_RC).json({
      message: "Access denied",
      status: UNAUTHORIZED_RC,
      success: false,
    });
  }

  req.user = user;

  next();
};

exports.isUserNormalUser = async (req, res, next) => {
  const userId = getAuthUserId(req);

  if (!verifyUserId(userId)) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide userId",
      status: BAD_REQUEST_RC,
    });
  }

  const userQueryResponse = await fetchUserByUserId(userId);

  if (!userQueryResponse) {
    return res.status(200).json({
      message: "Something went wrong, try again",
    });
  }

  if (!userQueryResponse.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: userQueryResponse.message,
      success: false,
      timestamp: Date.now(),
    });
  }

  const user = userQueryResponse.response[0][0];

  if (!user) {
    return res.status(NOT_FOUND_RC).json({
      message: `Invalid userId`,
      success: false,
    });
  }

  if (user.userRole !== USER_ROLE) {
    return res.status(UNAUTHORIZED_RC).json({
      message: "Access denied",
      status: UNAUTHORIZED_RC,
      success: false,
    });
  }

  req.user = user;

  next();
};

exports.isUserLoggedIn = async (req, res, next) => {
  const userId = getAuthUserId(req);
  const state = req.headers["state"];

  if (!verifyUserId(userId)) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Missing auth userId",
      status: BAD_REQUEST_RC,
      success: false,
    });
  }

  if (!state) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Invalid request. Please provide state",
      success: false,
      timestamp: Date.now(),
    });
  }

  next();
};

// helper methods
const fetchUserByUserId = async (userId) => {
  try {
    return await makeDbCall(FIND_USER_BY_USERID_QUERY, [userId]);
  } catch (err) {
    console.error(`Error fetching user with userId: ${userId}`);
    return null;
  }
};

const verifyUserId = (userId) => {
  return (
    userId !== undefined &&
    userId !== null &&
    userId !== "null" &&
    String(userId).length > 10
  );
};

const getAuthUserId = (req) => {
  const userId = req.headers["user-id"] || req.query.userId;

  return userId;
};
