const { DynamoDBStreams } = require("aws-sdk");
const WebinarFeedback = require("../models/WebinarFeedback");

exports.AddUserFeedback = async (req, res) => {
  const { email, feedback } = req.body;

  if (!validate.success) {
    return res.status(BAD_REQUEST_RC).json({
      message: validate.message,
      success: false,
      timestamp: Date.now(),
    });
  }

  try {
    const saveResponse = await WebinarFeedback.create({ email, feedback });
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR_RC).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.GetWebinarFeedbacks = async (req, res) => {
  const { webinarId } = req.query;

  if (!validateString(webinarId)) {
    return res.status(BAD_REQUEST_RC).json({
      message: "Please provide webinarId",
      success: false,
      timestamp: Date.now(),
    });
  }

  try {
    const webinarFeedback = await WebinarFeedback.find({ webinarId });

    return res.status(OK_RC).json({
      feedbacks: webinarFeedback,
      success: true,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.log(err);

    return res.status(INTERNAL_SERVER_ERROR_RC).json({
      message: "Server error",
      success: false,
      timestamp: Date.now(),
    });
  }
};

const validate = (email, feedback) => {
  if (!validateEmail(email)) {
    return { success: false, message: "Invalid email" };
  }

  if (!validateString(feedback)) {
    return { success: false, message: "Invalid feedback response" };
  }

  return { success: true };
};

const validateEmail = (email) => {
  return (
    validateString(email) &&
    String(email)
      .toLowerCase()
      .trim()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  );
};

const validateString = (str) => {
  return str !== undefined && str !== null && String(str).trim().length > 0;
};
