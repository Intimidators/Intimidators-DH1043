const { DeletePost } = require("../controllers/AdminController");
const {
  PostHandle,
  UpdatePostStatus,
  Like,
  Comment,
  GetPendingPhotos,
  GetPendingVideos,
  GetApprovedPhotos,
  GetApprovedVideos,
  GetCommentsOnPost,
  GetLikedPosts,
  GetPhotosForUserId,
  GetVideosForUserId,
  GetPendingResearchWork,
  GetApprovedResearchWork,
  GetResearchWorkForUserId,
  GetCountApprovedPhotos,
  GetCountApprovedVideos,
} = require("../controllers/PostController");
const {
  deletePostRequestValidationMiddleware,
} = require("../middlewares/AdminMiddleware");
const {
  postHandleRequestValidatorMiddleware,
  updatePostStatusRequestValidatorMiddleware,
  likeRequestValidatorMiddleware,
  commentRequestValidatorMiddleware,
  getCommentRequestValidatorMiddleware,
  getLikedPostsRequestValidatorMiddleware,
  getMediaForUserIdRequestValidatorMiddleware,
} = require("../middlewares/PostValidationMiddleware");
const {
  isUserLoggedIn,
  isUserAdmin,
} = require("../middlewares/UserMiddleware");

const router = require("express").Router();

// POST requests
router
  .route("/postHandle")
  .post(isUserLoggedIn, postHandleRequestValidatorMiddleware, PostHandle);

router
  .route("/updatePostStatus")
  .post(
    isUserLoggedIn,
    isUserAdmin,
    updatePostStatusRequestValidatorMiddleware,
    UpdatePostStatus
  );

router
  .route("/like")
  .post(isUserLoggedIn, likeRequestValidatorMiddleware, Like);

router
  .route("/comment")
  .post(isUserLoggedIn, commentRequestValidatorMiddleware, Comment);

// GET requests
router
  .route("/getPendingPhotos")
  .get(isUserLoggedIn, isUserAdmin, GetPendingPhotos);

router
  .route("/getPendingVideos")
  .get(isUserLoggedIn, isUserAdmin, GetPendingVideos);

router.route("/getApprovedPhotos").get(GetApprovedPhotos);

router.route("/getApprovedVideos").get(GetApprovedVideos);

router
  .route("/getCommentsOnPost")
  .get(getCommentRequestValidatorMiddleware, GetCommentsOnPost);

router
  .route("/getLikedPosts")
  .get(isUserLoggedIn, getLikedPostsRequestValidatorMiddleware, GetLikedPosts);

router
  .route("/getPhotosForUserId")
  .get(
    isUserLoggedIn,
    getMediaForUserIdRequestValidatorMiddleware,
    GetPhotosForUserId
  );

router
  .route("/getVideosForUserId")
  .get(
    isUserLoggedIn,
    getMediaForUserIdRequestValidatorMiddleware,
    GetVideosForUserId
  );

router
  .route("/getPendingResearchWork")
  .get(isUserLoggedIn, GetPendingResearchWork);

router.route("/getApprovedResearchWork").get(GetApprovedResearchWork);

router
  .route("/getResearchWorkForUserId")
  .get(
    isUserLoggedIn,
    getMediaForUserIdRequestValidatorMiddleware,
    GetResearchWorkForUserId
  );

router
  .route("/getCountOfApprovedPhotos")
  .get(isUserLoggedIn, isUserAdmin, GetCountApprovedPhotos);

router
  .route("/getCountOfApprovedVideos")
  .get(isUserLoggedIn, isUserAdmin, GetCountApprovedVideos);

router
  .route("/deletePost")
  .post(isUserLoggedIn, deletePostRequestValidationMiddleware, DeletePost);

module.exports = router;
