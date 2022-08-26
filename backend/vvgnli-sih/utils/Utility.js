exports.getIpFromRequest = (req) => {
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.ip ||
    req.socket.remoteAddress
  );
};
exports.getServerBaseIP = (req) => {
  const protocol = req.protocol;
  const host = req.hostname;

  if (process.env.NODE_ENV === "production") {
    return `${protocol}://${host}`;
  }

  const port = process.env.PORT || req.socket.localPort;

  return `${protocol}://${host}:${port}`;
};

exports.encodeToBase64 = (decoded) => {
  const buffer = Buffer.from(decoded);
  return buffer.toString("base64url");
};

exports.decodeBase64 = (encoded) => {
  const buffer = Buffer.from(encoded, "base64url");
  return buffer.toString("ascii");
};
