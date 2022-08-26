const {
  CreateNewWebinar,
  getWebinarInfo,
  ZoomCallbackHandler,
  addParticipantJoinedFromPortal,
  getJoinedUsersInformation,
  deleteWebinar,
  RegisterParticipant,
  GetRegisteredUsers,
  GetPastWebinars,
  GetOngoingWebinars,
  getFutureScheduledWebinars,
} = require("../controllers/WebinarController");
const {
  isUserAdmin,
  isUserLoggedIn,
} = require("../middlewares/UserMiddleware");
const {
  creatWebinarRequestValidateMiddleware,
  getWebinarInfoRequestMiddleware,
  addParticipantJoinedFromPortalRequestMiddleware,
  getJoinedUsersInformationRequestMiddleware,
  deleteWebinarRequestMiddleware,
  registerParticipantRequestMiddleware,
  getRegisteredUsersRequestMiddleware,
  getRequestStateProcessorMiddleware,
} = require("../middlewares/WebinarMiddleware");
const router = require("express").Router();

router
  .route("/createNewWebinar")
  .post(
    isUserLoggedIn,
    isUserAdmin,
    creatWebinarRequestValidateMiddleware,
    CreateNewWebinar
  );

router
  .route("/getWebinarInfo")
  .get(
    isUserLoggedIn,
    isUserAdmin,
    getWebinarInfoRequestMiddleware,
    getWebinarInfo
  );

router
  .route("/registerParticipant")
  .post(
    isUserLoggedIn,
    registerParticipantRequestMiddleware,
    RegisterParticipant
  );

router
  .route("/getJoinedUsersInfo")
  .get(
    isUserLoggedIn,
    isUserAdmin,
    getJoinedUsersInformationRequestMiddleware,
    getJoinedUsersInformation
  );

router
  .route("/addParticipantJoinedFromPortal")
  .post(
    isUserLoggedIn,
    addParticipantJoinedFromPortalRequestMiddleware,
    addParticipantJoinedFromPortal
  );

router
  .route("/deleteWebinar")
  .delete(
    isUserLoggedIn,
    isUserAdmin,
    deleteWebinarRequestMiddleware,
    deleteWebinar
  );

router
  .route("/getRegisteredUsers")
  .get(
    isUserLoggedIn,
    isUserAdmin,
    getRegisteredUsersRequestMiddleware,
    GetRegisteredUsers
  );

router
  .route("/getPastWebinars")
  .get(getRequestStateProcessorMiddleware, GetPastWebinars);

router
  .route("/getOngoingWebinars")
  .get(isUserLoggedIn, getRequestStateProcessorMiddleware, GetOngoingWebinars);

router
  .route("/getFutureWebinars")
  .get(
    isUserLoggedIn,
    getRequestStateProcessorMiddleware,
    getFutureScheduledWebinars
  );

router.route("/zoom-api-callback").post(ZoomCallbackHandler);

module.exports = router;
