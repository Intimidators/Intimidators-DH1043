const { S3 } = require("aws-sdk");
const crypto = require("crypto");

exports.s3Uploadv2 = async (files) => {
  const s3 = new S3();
  let contentType;

  if (files[0].mimetype.split("/")[0] === "image") {
    contentType = "image/jpg";
  } else if (files[0].mimetype.split("/")[0] === "video") {
    contentType = "video/mp4";
  } else {
    contentType = "application/pdf";
  }

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${crypto.randomUUID({
        disableEntropyCache: true,
      })}.${file.originalname.split(".").pop()}`,
      Body: file.buffer,
      ContentType: contentType,
    };
  });

  return (results = await Promise.all(
    params.map((param) => s3.upload(param).promise())
  ));
};
