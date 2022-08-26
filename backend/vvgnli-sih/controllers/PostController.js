const {
  SELECT_USER_ROLE_QUERY,
  INSERT_POST_DETAILS_QUERY,
  UPDATE_POST_STATUS_QUERY,
  DELETE_POST_DETAILS_QUERY,
  DELETE_MEDIA_DETAILS_QUERY,
  INSERT_LIKE_DETAILS,
  DELETE_LIKE_DETAILS,
  FIND_NAME_BY_USER_ID_QUERY,
  INSERT_COMMENT_DETAILS_QUERY,
  GET_PENDING_PHOTOS_QUERY,
  GET_PENDING_VIDEOS_QUERY,
  GET_APPROVED_PHOTOS_QUERY,
  GET_APPROVED_VIDEOS_QUERY,
  GET_COMMENTS_ON_POST_QUERY,
  GET_LIKED_POSTS_BY_USER_QUERY,
  GET_TOTAL_LIKES_ON_APPROVED_PHOTOS_QUERY,
  GET_TOTAL_COMMENTS_ON_APPROVED_PHOTOS_QUERY,
  GET_TOTAL_LIKES_ON_APPROVED_VIDEOS_QUERY,
  GET_TOTAL_COMMENTS_ON_APPROVED_VIDEOS_QUERY,
  GET_PHOTOS_FOR_USER_ID,
  GET_VIDEOS_FOR_USER_ID,
  GET_PENDING_RESEARCH_WORK_QUERY,
  GET_APPROVED_RESEARCH_WORK_QUERY,
  GET_RESEARCH_WORK_FOR_USER_ID,
  GET_COUNT_PENDING_PHOTOS_QUERY,
  GET_COUNT_APPROVED_PHOTOS_QUERY,
  GET_COUNT_PENDING_VIDEOS_QUERY,
  GET_COUNT_APPROVED_VIDEOS_QUERY,
  GET_COUNT_PENDING_RESEARCH_WORK_QUERY,
  GET_COUNT_APPROVED_RESEARCH_WORK_QUERY,
} = require("../configs/databaseConfig/DatabaseQueries");
const { makeDbCall } = require("../utils/DatabaseCalls");
const {
  CREATED_RC,
  OK_RC,
  BAD_REQUEST_RC,
  INTERNAL_SERVER_ERROR_RC,
} = require("../utils/ResponseCodes");
const { s3Delete } = require("../utils/S3Service");
const { getIpFromRequest } = require("../utils/Utility");
const getIpInfo = require("../utils/IpService");

const ROLE_ADMIN = 1;
exports.PostHandle = async (req, res) => {
  const { userId, mediaIdArray } = req.body;

  const fetchUserRoleQueryResult = await makeDbCall(SELECT_USER_ROLE_QUERY, [
    userId,
  ]);

  if (!fetchUserRoleQueryResult.success) {
    return checkSuccess(fetchUserRoleQueryResult, res);
  }

  const user = fetchUserRoleQueryResult.response[0][0];

  if (!user) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Invalid userId",
      status: BAD_REQUEST_RC,
    });
  }

  const status = user.userRole;

  if (status === ROLE_ADMIN) {
    const validateResponse = await validateAdminIp(req, req.body.state);

    if (!validateResponse.success) {
      return res.status(validateResponse.status).json({
        message: `You are not allowed to upload content for ${req.body.state} from ${validateResponse.location}`,
        success: false,
        timestamp: Date.now(),
      });
    }
  }

  const insertPostDetailsQueryResult = await makeDbCall(
    INSERT_POST_DETAILS_QUERY,
    [
      mediaIdArray.map((mediaIdSingle) => [
        userId,
        mediaIdSingle,
        status,
        req.body.state,
      ]),
    ]
  );

  if (!insertPostDetailsQueryResult.success) {
    return checkSuccess(insertPostDetailsQueryResult, res);
  }

  return res.status(CREATED_RC).json({
    message: `Post uploaded successfully with userId: ${userId}`,
    success: true,
    timestamp: Date.now(),
  });
};

exports.UpdatePostStatus = async (req, res) => {
  const { mediaId, postStatus } = req.body;

  if (postStatus === "1") {
    const updatePostStatusQueryResult = await makeDbCall(
      UPDATE_POST_STATUS_QUERY,
      [mediaId]
    );

    if (!updatePostStatusQueryResult.success) {
      return checkSuccess(updatePostStatusQueryResult, res);
    }
  } else {
    makeDbCall(DELETE_POST_DETAILS_QUERY, [mediaId]);

    makeDbCall(DELETE_MEDIA_DETAILS_QUERY, [mediaId]);

    return s3Delete(mediaId, res);
  }

  return res.status(OK_RC).json({
    message: "Post status updated successfully",
    success: true,
    timestamp: Date.now(),
  });
};

exports.Like = async (req, res) => {
  const { userId, mediaId, likeStatus } = req.body;

  if (likeStatus === "1") {
    const insertLikeDetailsQueryResult = await makeDbCall(INSERT_LIKE_DETAILS, [
      userId,
      mediaId,
    ]);

    if (!insertLikeDetailsQueryResult.success) {
      return checkSuccess(insertLikeDetailsQueryResult, res);
    }
  } else {
    const deleteLikeDetailsQuery = await makeDbCall(DELETE_LIKE_DETAILS, [
      userId,
      mediaId,
    ]);

    if (!deleteLikeDetailsQuery.success) {
      return checkSuccess(deleteLikeDetailsQuery, res);
    }
  }

  return res.status(OK_RC).json({
    message: "Like status updated successfully",
    success: true,
    timestamp: Date.now(),
  });
};

exports.Comment = async (req, res) => {
  const { userId, mediaId, commentData } = req.body;

  const findNameByUserIdQueryResult = await makeDbCall(
    FIND_NAME_BY_USER_ID_QUERY,
    [userId]
  );

  if (!findNameByUserIdQueryResult.success) {
    return checkSuccess(findNameByUserIdQueryResult, res);
  }

  const fullName = findNameByUserIdQueryResult.response[0][0].name;

  const insertCommentDetailsQueryResult = await makeDbCall(
    INSERT_COMMENT_DETAILS_QUERY,
    [mediaId, commentData, userId, fullName, Date.now()]
  );

  if (!insertCommentDetailsQueryResult.success) {
    return checkSuccess(insertCommentDetailsQueryResult, res);
  }

  return res.status(CREATED_RC).json({
    message: "Comment successfully",
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetPendingPhotos = async (req, res) => {
  let getPendingPhotosQueryResult;
  const state = req.headers["state"];

  if (!state) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide state",
      status: false,
      timestamp: Date.now(),
    });
  }
  if (Object.keys(req.query).length !== 0 && req.query.count === "true") {
    getPendingPhotosQueryResult = await makeDbCall(
      GET_COUNT_PENDING_PHOTOS_QUERY
    );
  } else {
    getPendingPhotosQueryResult = await makeDbCall(GET_PENDING_PHOTOS_QUERY, [
      state,
    ]);
  }

  if (!getPendingPhotosQueryResult.success) {
    return checkSuccess(getPendingPhotosQueryResult, res);
  }

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    pendingPhotos: getPendingPhotosQueryResult.response[0],
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetPendingVideos = async (req, res) => {
  let getPendingVideosQueryResult;
  const state = req.headers["state"];

  if (!state) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide state",
      status: false,
      timestamp: Date.now(),
    });
  }
  if (Object.keys(req.query).length !== 0 && req.query.count === "true") {
    getPendingVideosQueryResult = await makeDbCall(
      GET_COUNT_PENDING_VIDEOS_QUERY
    );
  } else {
    getPendingVideosQueryResult = await makeDbCall(GET_PENDING_VIDEOS_QUERY, [
      state,
    ]);
  }

  if (!getPendingVideosQueryResult.success) {
    return checkSuccess(getPendingVideosQueryResult, res);
  }

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    pendingVideos: getPendingVideosQueryResult.response[0],
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetApprovedPhotos = async (req, res) => {
  const state = req.headers["state"];

  if (!state) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide state",
      status: false,
      timestamp: Date.now(),
    });
  }
  const getApprovedPhotosQueryResult = await makeDbCall(
    GET_APPROVED_PHOTOS_QUERY,
    [state]
  );

  if (!getApprovedPhotosQueryResult.success) {
    return checkSuccess(getApprovedPhotosQueryResult, res);
  }

  const getTotalLikesQueryResult = await makeDbCall(
    GET_TOTAL_LIKES_ON_APPROVED_PHOTOS_QUERY
  );

  if (!getTotalLikesQueryResult.success) {
    return checkSuccess(getTotalLikesQueryResult, res);
  }

  const getTotalCommentsQueryResult = await makeDbCall(
    GET_TOTAL_COMMENTS_ON_APPROVED_PHOTOS_QUERY
  );

  if (!getTotalCommentsQueryResult.success) {
    return checkSuccess(getTotalCommentsQueryResult, res);
  }

  const approvedPhotosList = getApprovedPhotosQueryResult.response[0];
  const likePostList = getTotalLikesQueryResult.response[0];
  const commentPostList = getTotalCommentsQueryResult.response[0];

  let result = getApprovedMediaArray(
    approvedPhotosList,
    likePostList,
    commentPostList
  );

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    approvedPhotosArray: result,
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetApprovedVideos = async (req, res) => {
  const state = req.headers["state"];

  if (!state) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide state",
      status: false,
      timestamp: Date.now(),
    });
  }
  const getApprovedVideosQueryResult = await makeDbCall(
    GET_APPROVED_VIDEOS_QUERY,
    [state]
  );

  if (!getApprovedVideosQueryResult.success) {
    return checkSuccess(getApprovedVideosQueryResult, res);
  }

  const getTotalLikesQueryResult = await makeDbCall(
    GET_TOTAL_LIKES_ON_APPROVED_VIDEOS_QUERY
  );

  if (!getTotalLikesQueryResult.success) {
    return checkSuccess(getTotalLikesQueryResult, res);
  }

  const getTotalCommentsQueryResult = await makeDbCall(
    GET_TOTAL_COMMENTS_ON_APPROVED_VIDEOS_QUERY
  );

  if (!getTotalCommentsQueryResult.success) {
    return checkSuccess(getTotalCommentsQueryResult, res);
  }

  const approvedVideosList = getApprovedVideosQueryResult.response[0];
  const likePostList = getTotalLikesQueryResult.response[0];
  const commentPostList = getTotalCommentsQueryResult.response[0];

  let result = getApprovedMediaArray(
    approvedVideosList,
    likePostList,
    commentPostList
  );

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    approvedVideosArray: result,
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetCommentsOnPost = async (req, res) => {
  const { mediaId } = req.query;

  const getCommentsOnPostQueryResult = await makeDbCall(
    GET_COMMENTS_ON_POST_QUERY,
    [mediaId]
  );

  if (!getCommentsOnPostQueryResult.success) {
    return checkSuccess(getCommentsOnPostQueryResult, res);
  }

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    commentsOnPostArray: getCommentsOnPostQueryResult.response[0],
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetLikedPosts = async (req, res) => {
  const { userId } = req.query;

  const getLikedPostsQueryResult = await makeDbCall(
    GET_LIKED_POSTS_BY_USER_QUERY,
    [userId]
  );

  if (!getLikedPostsQueryResult.success) {
    return checkSuccess(getLikedPostsQueryResult, res);
  }

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    likedPostsArray: getLikedPostsQueryResult.response[0],
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetPhotosForUserId = async (req, res) => {
  const { userId } = req.query;
  const state = req.headers["state"];

  if (!state) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide state",
      status: false,
      timestamp: Date.now(),
    });
  }
  const getPhotosForUserIdQueryResult = await makeDbCall(
    GET_PHOTOS_FOR_USER_ID,
    [userId, state]
  );

  if (!getPhotosForUserIdQueryResult.success) {
    return checkSuccess(getPhotosForUserIdQueryResult, res);
  }

  let countOfApprovedAndPending = getCount(
    getPhotosForUserIdQueryResult.response[0]
  );

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    photosArray: getPhotosForUserIdQueryResult.response[0],
    countOfApprovedAndPendingMedia: countOfApprovedAndPending,
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetVideosForUserId = async (req, res) => {
  const { userId } = req.query;
  const state = req.headers["state"];

  if (!state) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide state",
      status: false,
      timestamp: Date.now(),
    });
  }
  const getVideosForUserIdQueryResult = await makeDbCall(
    GET_VIDEOS_FOR_USER_ID,
    [userId, state]
  );

  if (!getVideosForUserIdQueryResult.success) {
    return checkSuccess(getVideosForUserIdQueryResult, res);
  }

  let countOfApprovedAndPending = getCount(
    getVideosForUserIdQueryResult.response[0]
  );

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    videosArray: getVideosForUserIdQueryResult.response[0],
    countOfApprovedAndPendingMedia: countOfApprovedAndPending,
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetPendingResearchWork = async (req, res) => {
  let getPendingResearchWorkQueryResult;
  const state = req.headers["state"];

  if (!state) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide state",
      status: false,
      timestamp: Date.now(),
    });
  }
  if (Object.keys(req.query).length !== 0 && req.query.count === "true") {
    getPendingResearchWorkQueryResult = await makeDbCall(
      GET_COUNT_PENDING_RESEARCH_WORK_QUERY
    );
  } else {
    getPendingResearchWorkQueryResult = await makeDbCall(
      GET_PENDING_RESEARCH_WORK_QUERY,
      [state]
    );
  }

  if (!getPendingResearchWorkQueryResult.success) {
    return checkSuccess(getPendingResearchWorkQueryResult, res);
  }

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    pendingResearchWork: getPendingResearchWorkQueryResult.response[0],
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetApprovedResearchWork = async (req, res) => {
  let getApprovedResearchWorkQueryResult;
  const state = req.headers["state"];

  if (!state) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide state",
      status: false,
      timestamp: Date.now(),
    });
  }
  if (Object.keys(req.query).length !== 0 && req.query.count === "true") {
    getApprovedResearchWorkQueryResult = await makeDbCall(
      GET_COUNT_APPROVED_RESEARCH_WORK_QUERY
    );
  } else {
    getApprovedResearchWorkQueryResult = await makeDbCall(
      GET_APPROVED_RESEARCH_WORK_QUERY,
      [state]
    );
  }

  if (!getApprovedResearchWorkQueryResult.success) {
    return checkSuccess(getApprovedResearchWorkQueryResult, res);
  }

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    approvedResearchWork: getApprovedResearchWorkQueryResult.response[0],
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetResearchWorkForUserId = async (req, res) => {
  const { userId } = req.query;
  const state = req.headers["state"];

  if (!state) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide state",
      status: false,
      timestamp: Date.now(),
    });
  }
  const getResearchWorkQueryResult = await makeDbCall(
    GET_RESEARCH_WORK_FOR_USER_ID,
    [userId, state]
  );

  if (!getResearchWorkQueryResult.success) {
    return checkSuccess(getResearchWorkQueryResult, res);
  }

  let countOfApprovedAndPending = getCount(
    getResearchWorkQueryResult.response[0]
  );

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    researchWorkArray: getResearchWorkQueryResult.response[0],
    countOfApprovedAndPendingMedia: countOfApprovedAndPending,
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetCountApprovedPhotos = async (_, res) => {
  const getCountApprovedPhotosQueryResult = await makeDbCall(
    GET_COUNT_APPROVED_PHOTOS_QUERY
  );

  if (!getCountApprovedPhotosQueryResult.success) {
    return checkSuccess(getCountApprovedPhotosQueryResult, res);
  }

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    approvedPhotosCount: getCountApprovedPhotosQueryResult.response[0],
    success: true,
    timestamp: Date.now(),
  });
};

exports.GetCountApprovedVideos = async (_, res) => {
  const getCountApprovedVideosQueryResult = await makeDbCall(
    GET_COUNT_APPROVED_VIDEOS_QUERY
  );

  if (!getCountApprovedVideosQueryResult.success) {
    return checkSuccess(getCountApprovedVideosQueryResult, res);
  }

  return res.status(OK_RC).json({
    message: "Fetched successfully",
    approvedVideosCount: getCountApprovedVideosQueryResult.response[0],
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

const getApprovedMediaArray = (
  ApprovedMediaList,
  likePostList,
  commentPostList
) => {
  let result = [];

  ApprovedMediaList.forEach((postDetails) => {
    let obj = {
      mediaId: postDetails.mediaId,
      mediaURL: postDetails.mediaURL,
      name: postDetails.name,
      timestamp: postDetails.timestamp,
      totalLikeCount:
        likePostList.find((like) => like.mediaId === `${postDetails.mediaId}`)
          ?.totalLikes || 0,
      totalCommentCount:
        commentPostList.find(
          (comment) => comment.mediaId === `${postDetails.mediaId}`
        )?.totalComments || 0,
      state: postDetails.state,
    };

    result.push(obj);
  });

  return result;
};

const getCount = (mediaArray) => {
  let approvedCount = 0,
    pendingCount = 0;

  mediaArray.forEach((media) => {
    if (media.status === 1) approvedCount++;
    else pendingCount++;
  });

  return {
    countOfApprovedMedia: approvedCount,
    countOfPendingMedia: pendingCount,
  };
};

const validateAdminIp = async (req, state) => {
  try {
    const ip = getIpFromRequest(req);
    const data = await getIpInfo(ip);

    console.log("data", data);

    if (!data || !data.regionName || !state) {
      return { success: false, status: INTERNAL_SERVER_ERROR_RC };
    }

    if (String(data.regionName).toLowerCase() === String(state).toLowerCase()) {
      return { success: true, status: OK_RC };
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
