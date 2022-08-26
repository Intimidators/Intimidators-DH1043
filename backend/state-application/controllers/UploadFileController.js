const {
  INSERT_MEDIA_DETAILS_QUERY,
  FETCH_MEDIA_URL_QUERY,
} = require("../configs/databaseConfig/DatabaseQueries");
const { s3Uploadv2 } = require("../utils/S3Service");
const { makeDbCall } = require("../utils/DatabaseCalls");

exports.Upload = async (req, res) => {
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

  const fetchMediaURLQueryResult = await makeDbCall(FETCH_MEDIA_URL_QUERY, [
    mediaIdArray[0],
  ]);
  
  if (!fetchMediaURLQueryResult.success) {
    return res.status(fetchMediaURLQueryResult.status).json({
      success: false,
      message: fetchMediaURLQueryResult.message,
    });
  }

  return res.status(200).json({
    message: "Media file uploaded successfully",
    success: true,
    mediaId: mediaIdArray[0],
    mediaURL: fetchMediaURLQueryResult.response[0][0].mediaURL,
    timestamp: Date.now(),
  });
};
