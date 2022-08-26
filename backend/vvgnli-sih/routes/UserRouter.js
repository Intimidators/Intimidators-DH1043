const { ProcessPasswordUpdate } = require("../controllers/CommonController");
const { isUserLoggedIn } = require("../middlewares/UserMiddleware");
const {
  passwordChangeRequestValidatorMiddleware,
} = require("../middlewares/ValidationMiddleware");

const router = require("express").Router();

router
  .route("/update-password")
  .post(
    isUserLoggedIn,
    passwordChangeRequestValidatorMiddleware,
    ProcessPasswordUpdate
  );

module.exports = router;
