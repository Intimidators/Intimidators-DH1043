exports.CREATE_DB_IF_NOT_EXISTS_QUERY = `CREATE DATABASE IF NOT EXISTS ${
  process.env.MYSQL_DB_NAME || "vvgnli_sih"
}`;

exports.CREATE_ADDRESS_DETAILS_TABLE =
  "CREATE TABLE IF NOT EXISTS address_details(addressId varchar(16), addressL1 varchar(70), addressL2 varchar(70), city varchar(20), country varchar(30), zipCode varchar(6), primary key(addressId))";

exports.CREATE_USER_DETAILS_TABLE =
  "CREATE TABLE IF NOT EXISTS user_details(userId varchar(16), name varchar(50), password varchar(100) NOT NULL, fatherName varchar(50), gender varchar(20), dateOfBirth date, religion varchar(20), phoneNumber varchar(30), userName varchar(30), emailAddress varchar(30), userRole int DEFAULT 2, isTempPassword BOOLEAN DEFAULT false, tpIssuedAt BIGINT DEFAULT 0 , addressId varchar(16), isDeleted bit DEFAULT 0, deleteTimeStamp bigint, blockReason varchar(200), lastLoginTimeStamp bigint, signupIp varchar(30), loginIps varchar(200), isVerified boolean default false, state varchar(100), PRIMARY KEY (userId), unique key unq_user_details_2 (emailAddress,userRole), CONSTRAINT user_details_ibfk_1 FOREIGN KEY (addressId) REFERENCES address_details (addressId))";

exports.CREATE_MEDIA_DETAILS_TABLE =
  "CREATE TABLE IF NOT EXISTS media_details(mediaId varchar(100), mediaURL varchar(200), fileType int, currentTimeStamp BIGINT, primary key(mediaId))";

exports.CREATE_POST_DETAILS_TABLE =
  "CREATE TABLE IF NOT EXISTS post_details(userId varchar(16), mediaId varchar(100), status int DEFAULT 2, state varchar(100), PRIMARY KEY (userId,mediaId), CONSTRAINT post_details_ibfk_1 FOREIGN KEY (userId) REFERENCES user_details (userId), CONSTRAINT post_details_ibfk_2 FOREIGN KEY (mediaId) REFERENCES media_details (mediaId))";

exports.CREATE_COMMENT_DETAILS_TABLE =
  "CREATE TABLE IF NOT EXISTS comment_details (commentId int auto_increment, mediaId varchar(200), commentData varchar(5000), userId varchar(16), fullName varchar(200), state varchar(100), primary key(commentId), CONSTRAINT comment_details_ibfk_1 FOREIGN KEY (mediaId) REFERENCES media_details (mediaId), CONSTRAINT comment_details_ibfk_2 FOREIGN KEY (userId) REFERENCES user_details (userId))";

exports.CREATE_LIKE_DETAILS_TABLE =
  "CREATE TABLE IF NOT EXISTS like_details (userId varchar(16), mediaId varchar(200), primary key(userId, mediaId), CONSTRAINT like_details_ibfk_1 FOREIGN KEY (userId) REFERENCES user_details (userId), CONSTRAINT like_details_ibfk_2 FOREIGN KEY (mediaId) REFERENCES media_details (mediaId))";

exports.INSERT_ADDRESS_DETAILS_QUERY =
  "INSERT INTO address_details (addressId, addressL1, addressL2, city, country, zipCode) VALUES (?,?,?,?,?,?)";

exports.INSERT_USER_DETAILS_QUERY = `INSERT INTO user_details (userId, name, fatherName, gender, dateOfBirth, religion, phoneNumber, userName, emailAddress, signupIp, addressId, password, state) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

exports.FIND_USER_BY_EMAIL_QUERY =
  "SELECT * from user_details WHERE emailAddress = ?";

exports.FIND_USER_BY_EMAIL_STATE_QUERY =
  "SELECT * FROM user_details WHERE emailAddress = ? AND state = ?";

exports.INSERT_MEDIA_DETAILS_QUERY =
  "Insert into media_details(mediaId, mediaURL, fileType, currentTimeStamp) values ?";

exports.SELECT_USER_ROLE_QUERY =
  "Select userRole from user_details where userId = ?";

exports.INSERT_POST_DETAILS_QUERY =
  "Insert into post_details (userId, mediaId, status, state) values ?";

exports.UPDATE_POST_STATUS_QUERY =
  "Update post_details set status = 1 where mediaId = ?";

exports.DELETE_POST_DETAILS_QUERY =
  "Delete from post_details where mediaId = ?";

exports.DELETE_MEDIA_DETAILS_QUERY =
  "Delete from media_details where mediaId = ?";

exports.INSERT_LIKE_DETAILS = "Insert into like_details values(?,?)";

exports.DELETE_LIKE_DETAILS =
  "Delete from like_details where userId = ? and mediaId = ?";

exports.FIND_NAME_BY_USER_ID_QUERY =
  "Select name from user_details where userId = ?";

exports.INSERT_COMMENT_DETAILS_QUERY =
  "Insert into comment_details(mediaId, commentData, userId, fullName, commentTimeStamp) values (?,?,?,?,?)";

exports.GET_PENDING_PHOTOS_QUERY =
  "Select m.mediaId, m.mediaURL, p.userId, m.currentTimeStamp from media_details m, post_details p where p.mediaId = m.mediaId and p.status = 2 and m.fileType = 1 and p.state = ?";

exports.GET_PENDING_VIDEOS_QUERY =
  "Select m.mediaId, m.mediaURL, p.userId, m.currentTimeStamp from media_details m, post_details p where p.mediaId = m.mediaId and p.status = 2 and m.fileType = 2 and p.state = ?";

exports.GET_APPROVED_PHOTOS_QUERY =
  "Select m.mediaId, m.mediaURL, u.name, m.currentTimeStamp, p.state from media_details m, post_details p, user_details u where p.mediaId = m.mediaId and p.status = 1 and m.fileType = 1 and p.userId = u.userId  and p.state = ?";

exports.GET_TOTAL_LIKES_ON_APPROVED_PHOTOS_QUERY =
  "Select l.mediaId , count(l.userId) as totalLikes from like_details l where l.mediaId in (select m.mediaId from post_details p, media_details m where p.status = 1 and m.fileType = 1 and p.mediaId = m.mediaId) group by l.mediaId";

exports.GET_TOTAL_COMMENTS_ON_APPROVED_PHOTOS_QUERY =
  "Select c.mediaId , count(c.commentId) as totalComments from comment_details c where c.mediaId in (select m.mediaId from post_details p, media_details m where p.status = 1 and m.fileType = 1 and p.mediaId = m.mediaId) group by c.mediaId";

exports.GET_APPROVED_VIDEOS_QUERY =
  "Select m.mediaId, m.mediaURL, u.name,  p.state, m.currentTimeStamp from media_details m, post_details p, user_details u where p.mediaId = m.mediaId and p.status = 1 and m.fileType = 2 and p.userId = u.userId and p.state = ?";

exports.GET_TOTAL_LIKES_ON_APPROVED_VIDEOS_QUERY =
  "Select l.mediaId , count(l.userId) as totalLikes from like_details l where l.mediaId in (select m.mediaId from post_details p, media_details m where p.status = 1 and m.fileType = 2 and p.mediaId = m.mediaId) group by l.mediaId";

exports.GET_TOTAL_COMMENTS_ON_APPROVED_VIDEOS_QUERY =
  "Select c.mediaId , count(c.commentId) as totalComments from comment_details c where c.mediaId in (select m.mediaId from post_details p, media_details m where p.status = 1 and m.fileType = 2 and p.mediaId = m.mediaId) group by c.mediaId";

exports.GET_COMMENTS_ON_POST_QUERY =
  "Select fullName, commentData, commentTimeStamp from comment_details where mediaId = ? order by commentTimeStamp asc";

exports.GET_LIKED_POSTS_BY_USER_QUERY =
  "Select mediaId from like_details where userId = ?";

exports.FIND_USER_BY_USERNAME_QUERY =
  "SELECT * from user_details WHERE userName = ?";

exports.FIND_USER_BY_EMAIL_QUERY =
  "SELECT * from user_details WHERE emailAddress = ?";

exports.PASSWORD_UPDATE_QUERY =
  "UPDATE user_details SET password = ?, isTempPassword = ?, tpIssuedAt = ? WHERE emailAddress = ? AND userId = ?";

exports.DELETE_ENTRY_FROM_ADDRESS_DETAILS_QUERY =
  "DELETE FROM address_details WHERE addressId = ?";

exports.GET_PHOTOS_FOR_USER_ID =
  "Select m.mediaId, m.mediaURL, p.status, m.currentTimeStamp from media_details m, post_details p where m.mediaId = p.mediaId and p.userId = ? and m.fileType = 1 and p.state = ?";

exports.GET_VIDEOS_FOR_USER_ID =
  "Select m.mediaId, m.mediaURL, p.status, m.currentTimeStamp from media_details m, post_details p where m.mediaId = p.mediaId and p.userId = ? and m.fileType = 2 and p.state = ?";

exports.GET_PENDING_RESEARCH_WORK_QUERY =
  "Select m.mediaId, m.mediaURL, p.userId, m.currentTimeStamp from media_details m, post_details p where p.mediaId = m.mediaId and p.status = 2 and m.fileType = 3 and p.state = ?";

exports.GET_APPROVED_RESEARCH_WORK_QUERY =
  "Select m.mediaId, m.mediaURL, u.name, u.userId, m.currentTimeStamp from media_details m, post_details p, user_details u where p.mediaId = m.mediaId and p.status = 1 and m.fileType = 3 and p.userId = u.userId and p.state = ?";

exports.GET_RESEARCH_WORK_FOR_USER_ID =
  "Select m.mediaId, m.mediaURL, p.status, m.currentTimeStamp from media_details m, post_details p where m.mediaId = p.mediaId and p.userId = ? and m.fileType = 3 and p.state = ?";

exports.GET_COUNT_PENDING_PHOTOS_QUERY =
  "Select count(m.mediaId) as totalPendingPhotos from post_details p, media_details m where m.mediaId = p.mediaId and p.status = 2 and m.fileType = 1 group by m.fileType";

exports.GET_COUNT_APPROVED_PHOTOS_QUERY =
  "select count(m.mediaId) as totalApprovedPhotos from post_details p, media_details m where m.mediaId = p.mediaId and p.status = 1 and m.fileType = 1 group by m.fileType";

exports.GET_COUNT_PENDING_VIDEOS_QUERY =
  "select count(m.mediaId) as totalPendingVideos from post_details p, media_details m where m.mediaId = p.mediaId and p.status = 2 and m.fileType = 2 group by m.fileType";

exports.GET_COUNT_APPROVED_VIDEOS_QUERY =
  "select count(m.mediaId) as totalApprovedVideos from post_details p, media_details m where m.mediaId = p.mediaId and p.status = 1 and m.fileType = 2 group by m.fileType";

exports.GET_COUNT_PENDING_RESEARCH_WORK_QUERY =
  "select count(m.mediaId) as totalPendingResearchWork from post_details p, media_details m where m.mediaId = p.mediaId and p.status = 2 and m.fileType = 3 group by m.fileType";

exports.GET_COUNT_APPROVED_RESEARCH_WORK_QUERY =
  "select count(m.mediaId) as totalApprovedResearchWork from post_details p, media_details m where m.mediaId = p.mediaId and p.status = 1 and m.fileType = 3 group by m.fileType";

exports.GET_ADDRESS_ID_FOR_USER_ID_QUERY =
  "Select addressId from user_details where userId = ?";

exports.DELETE_ENTRY_FROM_USER_DETAILS_QUERY =
  "delete from user_details where userId = ?";

exports.GET_COUNT_OF_REGISTERED_USER_QUERY =
  "Select count(userId) as totalUsers from user_details where isDeleted is NULL or isDeleted = 0";

exports.GET_DETAILS_OF_REGISTERED_USER_QUERY =
  "Select userId, emailAddress, userName, userRole, state from user_details where isDeleted is NULL or isDeleted = 0";

exports.CHANGE_USER_ROLE_QUERY =
  "Update user_details set userRole = ? where userId = ?";

exports.FIND_USER_BY_USERID_QUERY =
  "SELECT * FROM user_details WHERE userId = ?";

exports.CREATE_PROFILE_DETAILS_TABLE =
  "Create table if not exists profile_details (userId varchar(16), mediaId varchar(100), primary key(userId), CONSTRAINT profile_details_ibfk_1 FOREIGN KEY (userId) REFERENCES user_details (userId), CONSTRAINT profile_details_ibfk_2 FOREIGN KEY (mediaId) REFERENCES media_details (mediaId))";

exports.FIND_USER_BY_USER_ID_IN_PROFILE_TABLE_QUERY =
  "Select * from profile_details where userId = ?";

exports.INSERT_PROFILE_DETAILS_QUERY =
  "Insert into profile_details values (?,?)";

exports.UPDATE_PROFILE_DETAILS_QUERY =
  "Update profile_details set mediaId = ? where userId = ?";

exports.FETCH_PROFILE_PIC_QUERY =
  "Select m.mediaURL from media_details m, profile_details p where p.mediaId = m.mediaId and p.userId = ?";

exports.DELETE_USER_QUERY =
  "update user_details set isDeleted = 1, deleteTimeStamp = ?, blockReason = ? where userId = ?";

exports.CHECK_IS_DELETED_USER_QUERY =
  "Select isDeleted, blockReason from user_details where emailAddress = ?";

exports.SELECT_LOGIN_IPS_QUERY =
  "Select loginIps from user_details where emailAddress = ?";

exports.INSERT_FIRST_LOGIN_IP_QUERY =
  "Update user_details set loginIps = ? where emailAddress = ?";

exports.FETCH_LOGIN_IPS_QUERY =
  "Select loginIps from user_details where emailAddress = ?";

exports.INSERT_UPDATED_LOGIN_IPS_QUERY =
  "Update user_details set loginIps = ? where emailAddress = ?";

exports.FIND_ADDRESS_DETAILS_QUERY =
  "Select * from address_details where addressId = ?";

exports.UPDATE_ACCOUNT_VERIFICATION_QUERY =
  "UPDATE user_details SET isVerified = ? WHERE userId = ? AND emailAddress = ?";

exports.CHANGE_PROFILE_QUERY =
  "Update user_details set name = ?, userName = ? where userId = ?";

exports.FIND_MEDIA_URL_QUERY =
  "Select m.mediaURL from media_details m, profile_details p where p.mediaId = m.mediaId and m.mediaId = ?";
