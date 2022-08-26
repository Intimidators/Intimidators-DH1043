const {
  GetUserDetails,
  DeleteUser,
  ChangeUserRole,
  DeletePost,
} = require("../controllers/AdminController");
const {
  changeUserRoleRequestValidationMiddleware,
  deleteUserRequestValidationMiddleware,
  deletePostRequestValidationMiddleware,
} = require("../middlewares/AdminMiddleware");
const {
  isUserLoggedIn,
  isUserAdmin,
} = require("../middlewares/UserMiddleware");

const router = require("express").Router();

router
  .route("/deleteUser")
  .post(
    isUserLoggedIn,
    isUserAdmin,
    deleteUserRequestValidationMiddleware,
    DeleteUser
  );

router
  .route("/changeUserRole")
  .patch(
    isUserLoggedIn,
    isUserAdmin,
    changeUserRoleRequestValidationMiddleware,
    ChangeUserRole
  );

router
  .route("/getUserDetails")
  .get(isUserLoggedIn, isUserAdmin, GetUserDetails);

module.exports = router;
