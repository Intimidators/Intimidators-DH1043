exports.validateFileUploadRequest = (req) => {
  if (req.files === null || req.files === undefined || req.files.length === 0) {
    return {
      message: "please upload a file",
      success: false,
    };
  }

  let isProperFileType = true;
  req.files.forEach(function (file) {
    console.log(file.mimetype);
    if (
      file.mimetype.split("/")[0] !== "image" &&
      file.mimetype.split("/")[0] !== "video"
    ) {
      isProperFileType = false;
    }
  });
  if (!isProperFileType) {
    return {
      message: "invalid file type",
      success: false,
    };
  }
  return {
    message: "validated successfully",
    success: true,
  };
};

exports.validateResearchWorkRequest = (req) => {
  if (req.files === null || req.files === undefined || req.files.length === 0) {
    return {
      message: "please upload a file",
      success: false,
    };
  }

  let isProperFileType = true;
  req.files.forEach(function (file) {
    if (
      file.mimetype.split("/")[1] !== "pdf"
    ) {
      isProperFileType = false;
    }
  });
  if (!isProperFileType) {
    return {
      message: "invalid file type",
      success: false,
    };
  }
  return {
    message: "validated successfully",
    success: true,
  };
}
