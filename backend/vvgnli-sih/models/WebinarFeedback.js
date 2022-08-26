const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email id is mandatory field"],
    },
    feedback: {
      type: String,
      required: [true, "user Feedback is mandatory"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebinarFeedback", FeedbackSchema);
