const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "Please provide userId"],
  },
  data: {
    type: String,
    required: [true, "Please provide data to dump in logs"],
  },
  timestamp: {
    type: Number,
    default: Date.now,
  },
});

module.exports = mongoose.model("Log", logSchema);
