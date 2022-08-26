exports.CREATE_DB_IF_NOT_EXISTS_QUERY = `CREATE DATABASE IF NOT EXISTS ${
  process.env.MYSQL_DB_NAME || "testdb"
}`;

exports.CREATE_MEDIA_DETAILS_TABLE =
  "CREATE TABLE IF NOT EXISTS media_details(mediaId varchar(100), mediaURL varchar(200), fileType int, currentTimeStamp BIGINT, primary key(mediaId))";

exports.INSERT_MEDIA_DETAILS_QUERY =
  "Insert into media_details(mediaId, mediaURL, fileType, currentTimeStamp) values ?";

exports.FETCH_MEDIA_URL_QUERY =
  "Select mediaURL from media_details where mediaId = ?";
