require("dotenv").config({
  path: "./configs/.env",
});

// fundamental imports
const express = require("express"); // express import
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");

// routes import
const UploadFileRouter = require("./routes/UploadFileRouter");

// middlewares registration
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// router middlewares registration
app.use("/api/vvgnli/v1/", UploadFileRouter);

app.get("/", (_, res) => {
  res.status(200).json({
    message: "Welcome to VVGNLI test Backend Application API",
    status: 200,
    success: true,
    timestamp: Date.now(),
  });
});

app.all("/*", (_, res) => {
  res.status(404).json({
    message: `Requested resource not found`,
    status: 404,
    success: false,
    timestamp: Date.now(),
  });
});

module.exports = app;
