const {
  Login,
  Signup,
  ForgotPassword,
  HandleProfilePic,
  VerifyAccount,
  ChangeProfile
} = require("../controllers/CommonController");
const {
  signupRequestValidatorMiddleware,
  loginRequestValidatorMiddleware,
  forgotPasswordRequestValidatorMiddleware,
  profilePicRequestValidatorMiddleware,
  verifyAccountRequestValidatorMiddleware,
  changeProfileRequestValidatorMiddleware,
} = require("../middlewares/ValidationMiddleware");
const router = require("express").Router();
const { isUserLoggedIn } = require("../middlewares/UserMiddleware");

router.route("/signup").post(signupRequestValidatorMiddleware, Signup);

router.route("/login").post(loginRequestValidatorMiddleware, Login);

router
  .route("/verifyAccount")
  .get(verifyAccountRequestValidatorMiddleware, VerifyAccount);

router
  .route("/forgot-password")
  .post(forgotPasswordRequestValidatorMiddleware, ForgotPassword);

router
  .route("/handleProfilePic")
  .post(isUserLoggedIn, profilePicRequestValidatorMiddleware, HandleProfilePic);

router
  .route("/updateProfile")
  .patch(isUserLoggedIn, changeProfileRequestValidatorMiddleware, ChangeProfile);

module.exports = router;
