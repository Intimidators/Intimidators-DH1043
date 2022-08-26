const axios = require("axios").create({
  baseURL: process.env.LOG_APP_URL || "https://vvgnlilogs.herokuapp.com",
});

const putLog = (userId, data) => {
  axios.post("/api/v1/logs", {
    userId,
    data,
  });
};

const getLog = async (userId) => {
  const resp = await axios.get(`/api/v1/logs?userId=${userId}`);
  console.log(resp);
};

module.exports = { putLog, getLog };
