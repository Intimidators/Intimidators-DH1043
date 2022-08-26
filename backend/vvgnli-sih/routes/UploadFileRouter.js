const { Upload } = require("../controllers/UploadFileController");
const multer = require("multer");
const {
  uploadRequestValidatorMiddleware,
  uploadResearchWorkValidatorMiddleware,
} = require("../middlewares/UploadValidationMiddleware");
const { isUserLoggedIn } = require("../middlewares/UserMiddleware");
// const {fileFilter} = require("../middlewares/FileFilter");
const router = require("express").Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router
  .route("/upload")
  .post(
    isUserLoggedIn,
    upload.array("file"),
    uploadRequestValidatorMiddleware,
    Upload
  );

router
  .route("/uploadResearchWork")
  .post(
    isUserLoggedIn,
    upload.array("file"),
    uploadResearchWorkValidatorMiddleware,
    Upload
  );

module.exports = router;
