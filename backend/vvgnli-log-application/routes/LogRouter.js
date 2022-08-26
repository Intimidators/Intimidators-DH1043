const {
  PutLogController,
  GetLogController,
} = require("../controller/LogController");
const {
  PutRequestValidationMiddleware,
  GetRequestValidationMiddleware,
} = require("../middleware/LogRequestMiddleware");

const router = require("express").Router();

router.route("/").post(PutRequestValidationMiddleware, PutLogController);

router.route("/").get(GetRequestValidationMiddleware, GetLogController);

module.exports = router;
