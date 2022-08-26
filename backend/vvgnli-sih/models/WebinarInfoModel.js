const mongoose = require("mongoose");

const WebinarInfoSchema = new mongoose.Schema(
  {
    webinarId: {
      type: String,
      required: [true, "Please provide webinarId"],
      unique: [true, "webinarId already exists"],
    },
    adminUserId: {
      type: String,
      required: [true, "Please provide adminUserId"],
      minlength: [10, "adminUserId should be of minimum 10 size"],
    },
    startTime: {
      type: Date,
      required: [true, "Please provide startTime"],
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
      required: [true, "Please provide duration"],
    },
    topic: {
      type: String,
      required: [true, "Please provide webinar topic"],
    },
    department: {
      type: String,
      required: [true, "Please provide webinar department"],
    },
    type: {
      type: Number,
      required: [true, "Please provide webinar type"],
    },
    timezone: {
      type: String,
      required: [true, "Please provide webinar timezone"],
      default: "Asia/Kolkata",
    },
    agenda: {
      type: String,
      required: [true, "Please provide webinar agenda"],
      default: null,
    },
    startUrl: {
      type: String,
      required: [true, "Please provide webinar startUrl"],
    },
    joinUrl: {
      type: String,
      required: [true, "Please provide webinar joinUrl"],
    },
    password: {
      type: String,
    },
    state: {
      type: String,
      required: [true, "Please provide valid state"],
    },
    host: {
      type: String,
      required: [true, "Please provide host name"],
    },
    coverPhoto: {
      type: String,
    },
    registerdUsers: [
      {
        userId: {
          type: String,
          required: [true, "Please provide userId for UFP"],
        },
        email: {
          type: String,
          required: [true, "Please provide email for UFP"],
        },
        timestamp: {
          type: Number,
          default: Date.now,
        },
        ip: {
          type: String,
        },
      },
    ],
    usersJoinedFromPlatform: [
      {
        userId: {
          type: String,
        },
        email: {
          type: String,
        },
        timestamp: {
          type: Number,
          default: Date.now,
        },
        ip: {
          type: String,
        },
      },
    ],
    joinedUsers: [
      {
        userId: { type: String },
        name: { type: String },
        email: { type: String },
        dateTime: { type: Date, default: Date.now },
      },
    ],
    recordingUrl: {
      type: String,
      default: null,
    },
    completed: { type: Boolean, default: false },
    ongoing: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebinarInfo", WebinarInfoSchema);
