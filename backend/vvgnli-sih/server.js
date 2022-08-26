require("dotenv").config({
  path: "./configs/.env",
});

// fundamental imports
const express = require("express"); // express import
const cookieParser = require("cookie-parser"); // cookie parser import
const rfs = require("rotating-file-stream");
const path = require("path");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

// routes import
const CommonRouter = require("./routes/CommonRouter");
const UploadFileRouter = require("./routes/UploadFileRouter");
const PostRouter = require("./routes/PostRouter");
const UserRouter = require("./routes/UserRouter");
const AdminRouter = require("./routes/AdminRouter");
const WebinarRouter = require("./routes/WebinarRouter");
const WebinarFeedbackRouter = require("./routes/WebinarFeedbackRouter");
const { makeDbCall } = require("./utils/DatabaseCalls");
const { INTERNAL_SERVER_ERROR_RC } = require("./utils/ResponseCodes");

// Logger related configs
var logStream = rfs.createStream("logs.log", {
  interval: "1d",
  path: path.join(__dirname, "/logs"),
});

app.use(morgan("short"));
app.use(morgan("common", { stream: logStream }));

// middlewares registration
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// router middlewares registration
app.use("/api/vvgnli/v1/", CommonRouter);
app.use("/api/vvgnli/v1/", UploadFileRouter);
app.use("/api/vvgnli/v1/post", PostRouter);
app.use("/api/vvgnli/v1/user", UserRouter);
app.use("/api/vvgnli/v1/admin", AdminRouter);
app.use("/api/vvgnli/v1/admin/webinars", WebinarRouter);
app.use("/api/vvgnli/v1/feedback", WebinarFeedbackRouter);

app.route("/api/vvgnli/v1/demo").post(async (req, res) => {
  const mediaId = req.body.mediaId;
  const mediaURL = req.body.mediaURL;

  if (!mediaId || !mediaURL) {
    return res.status(400).json({
      message: "Bad request",
      success: false,
      timestamp: Date.now(),
    });
  }

  const insertMediaDetailsQuery = await makeDbCall(
    "Insert into media_details values (?,?,?,?)",
    [mediaId, mediaURL, 1, Date.now()]
  );

  if (!insertMediaDetailsQuery.success) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      timestamp: Date.now(),
    });
  }

  const insertProfileDetailsDemoQueryResult = await makeDbCall(
    "Insert into post_details values (?,?,?,?)",
    ["dd12dbb4e067e9ab", mediaId, 1, "jharkhand"]
  );

  if (!insertProfileDetailsDemoQueryResult.success) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      timestamp: Date.now(),
    });
  }
  return res.status(201).json({
    message: "done",
    success: true,
  });
});

app.get("/", (_, res) => {
  res.status(200).json({
    message: "Welcome to VVGNLI Backend API",
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
