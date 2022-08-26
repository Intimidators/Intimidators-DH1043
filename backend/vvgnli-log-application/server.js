require("dotenv").config({
  path: "./configs/.env",
});

const express = require("express");
const LogRouter = require("./routes/LogRouter");
const app = express();

// app config
app.use(express.json());

// router config
app.use("/api/v1/logs", LogRouter);

app.get("/", (_, res) => {
  return res.status(200).json({
    message: "Welcome to VVGNLI_SIH log application",
    status: 200,
    timestamp: Date.now(),
  });
});

app.use("/*", (req, res) => {
  return res.status(404).json({
    message: `'${req.originalUrl}' not found`,
    method: req.method,
    status: 404,
    timestamp: Date.now(),
  });
});

module.exports = app;
