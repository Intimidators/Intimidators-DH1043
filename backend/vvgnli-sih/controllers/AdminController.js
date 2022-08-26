const {
  GET_COUNT_OF_REGISTERED_USER_QUERY,
  GET_DETAILS_OF_REGISTERED_USER_QUERY,
  CHANGE_USER_ROLE_QUERY,
  DELETE_POST_DETAILS_QUERY,
  DELETE_MEDIA_DETAILS_QUERY,
  DELETE_USER_QUERY,
  GET_RESEARCH_WORK_FOR_USER_ID,
} = require("../configs/databaseConfig/DatabaseQueries");
const { makeDbCall } = require("../utils/DatabaseCalls");
const { CREATED_RC, OK_RC, BAD_REQUEST_RC } = require("../utils/ResponseCodes");
const { s3Delete } = require("../utils/S3Service");
const { getIpFromRequest } = require("../utils/Utility");

exports.DeleteUser = async (req, res) => {
  const { userId, blockReason } = req.body;

  const deleteUserQueryResult = await makeDbCall(DELETE_USER_QUERY, [
    Date.now(),
    blockReason,
    userId,
  ]);

  if (!deleteUserQueryResult.success) {
    checkSuccess(deleteUserQueryResult, res);
  }

  return res.status(OK_RC).json({
    message: "deleted successfully",
    success: true,
    timestamp: Date.now(),
  });
};

exports.ChangeUserRole = async (req, res) => {
  const { userId, userRole } = req.body;

  const changeUserRoleQueryResult = await makeDbCall(CHANGE_USER_ROLE_QUERY, [
    userRole,
    userId,
  ]);

  if (!changeUserRoleQueryResult.success) {
    checkSuccess(changeUserRoleQueryResult, res);
  }

  return res.status(OK_RC).json({
    message: "User role changed successfully",
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetUserDetails = async (req, res) => {
  const state = req.headers["state"];

  if (!state) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Invalid get user details request",
      success: false,
      timestamp: Date.now(),
    });
  }

  let getUserDetailsQueryResult;

  if (
    Object.keys(req.query).length !== 0 &&
    (req.query.count === "true" || req.query.count === true)
  ) {
    getUserDetailsQueryResult = await makeDbCall(
      GET_COUNT_OF_REGISTERED_USER_QUERY,
      [state]
    );
  } else {
    getUserDetailsQueryResult = await makeDbCall(
      GET_DETAILS_OF_REGISTERED_USER_QUERY,
      [state]
    );
  }

  if (!getUserDetailsQueryResult.success) {
    return checkSuccess(getUserDetailsQueryResult, res);
  }

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    userDetails: getUserDetailsQueryResult.response[0],
    success: true,
    timestamp: Date.now(),
  });
};

exports.DeletePost = async (req, res) => {
  const { mediaId } = req.body;
  makeDbCall(DELETE_POST_DETAILS_QUERY, [mediaId]);

  makeDbCall(DELETE_MEDIA_DETAILS_QUERY, [mediaId]);

  s3Delete(mediaId, res);

  return res.status(OK_RC).json({
    message: "Post deleted successfully successfully",
    success: true,
    timestamp: Date.now(),
  });
};

const checkSuccess = (queryResult, res) => {
  return res.status(queryResult.status).json({
    success: false,
    message: queryResult.message,
    timestamp: Date.now(),
  });
};
