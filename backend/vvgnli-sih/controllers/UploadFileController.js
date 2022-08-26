const {
  INSERT_MEDIA_DETAILS_QUERY,
  FIND_USER_BY_USERID_QUERY,
} = require("../configs/databaseConfig/DatabaseQueries");
const { s3Uploadv2 } = require("../utils/S3Service");
const { makeDbCall } = require("../utils/DatabaseCalls");
const {
  OK_RC,
  INTERNAL_SERVER_ERROR_RC,
  BAD_REQUEST_RC,
} = require("../utils/ResponseCodes");
const { getIpFromRequest } = require("../utils/Utility");
const getIpInfo = require("../utils/IpService");

const ROLE_ADMIN = 1;

exports.Upload = async (req, res) => {
  const userId = req.headers["user-id"];
  const state = req.headers["state"];

  if (!userId || !state) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Invalid request, missing auth credentials",
      success: false,
      timestamp: Date.now(),
    });
  }

  const user = await findUserByUserId(userId);

  if (!user) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Invalid request, invalid userId",
      success: false,
      timestamp: Date.now(),
    });
  }

  const status = user.userRole;

  if (status === ROLE_ADMIN) {
    const validateResponse = await validateAdminIp(req, state);

    if (!validateResponse.success) {
      return res.status(validateResponse.status).json({
        message: `You are not allowed to upload content for ${state} from ${validateResponse.location}`,
        success: false,
        timestamp: Date.now(),
      });
    }
  }

  const results = await s3Uploadv2(req.files);

  const mediaIdArray = [];
  results.forEach(function (result) {
    mediaIdArray.push(result.Key);
  });

  const insertMediaQueryResult = await makeDbCall(INSERT_MEDIA_DETAILS_QUERY, [
    results.map((result) => [
      result.Key,
      result.Location,
      result.Key.split(".").pop() === "jpeg" ||
      result.Key.split(".").pop() === "jpg" ||
      result.Key.split(".").pop() === "png"
        ? 1
        : result.Key.split(".").pop() === "mp4" ||
          result.Key.split(".").pop() == "mkv"
        ? 2
        : 3,
      Date.now(),
    ]),
  ]);

  if (!insertMediaQueryResult.success) {
    return res.status(insertMediaQueryResult.status).json({
      success: false,
      message: insertMediaQueryResult.message,
    });
  }

  return res.status(OK_RC).json({
    message: "Media file uploaded successfully",
    success: true,
    mediaIdArray: mediaIdArray,
    timestamp: Date.now(),
  });
};

const validateAdminIp = async (req, state) => {
  try {
    const ip = getIpFromRequest(req);
    const data = await getIpInfo(ip);

    console.log("data: ", data);
    console.log("state: ", state);
    console.log("region: ", data?.regionName);

    if (!data || !data.regionName || !state) {
      return { success: false, status: INTERNAL_SERVER_ERROR_RC };
    }

    console.log("Fetched location: ", String(data.regionName).toLowerCase());
    console.log("Requested location: ", String(state).toLowerCase());

    if (String(data.regionName).toLowerCase() === String(state).toLowerCase()) {
      return { success: true, status: OK_RC, location: data.regionName };
    } else {
      return {
        success: false,
        location: data.regionName,
        status: BAD_REQUEST_RC,
      };
    }
  } catch (err) {
    console.log(err);
    return { success: false, status: INTERNAL_SERVER_ERROR_RC };
  }
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
