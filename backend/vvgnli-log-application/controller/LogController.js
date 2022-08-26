const Log = require("../models/Log");

exports.PutLogController = async (req, res) => {
  const { userId, data } = req.body;

  try {
    await Log.create({
      userId,
      data,
    });

    return res.status(200).json({
      message: "Log insert successful",
      timestamp: Date.now,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error saving log dump to database",
      timestamp: Date.now,
    });
  }
};

exports.GetLogController = async (req, res) => {
  const userId = req.query.userId;

  try {
    const logs = await Log.find({ userId });

    return res.status(200).json({
      message: `Fetch success for '${userId}'`,
      logs: logs.map((log) => {
        return {
          data: log.data,
          timestamp: log.timestamp,
        };
      }),
      timestamp: Date.now,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Error finding logs for userId: ${userId}`,
      timestamp: Date.now,
    });
  }
};
