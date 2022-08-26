const {
  AddUserFeedback,
  GetWebinarFeedbacks,
} = require("../controllers/FeedbackFormController");

const router = require("express").Router();

router.route("/addFeedback").post(AddUserFeedback);

router.route("/getFeedbacks").get(GetWebinarFeedbacks);

module.exports = router;
