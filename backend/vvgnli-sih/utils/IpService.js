const axios = require("axios");

const getIpInfo = async (ip) => {
  try {
    const url = process.env.IP_SERVICE_URL.replace("$IP", ip);

    const response = await axios.get(url);
    const data = response.data;

    console.log(data);

    if (data?.status === "success") {
      return {
        country: data.countryCode,
        countryName: data.country,
        region: data.region,
        regionName: data.regionName,
        city: data.city,
        zip: data.zip,
      };
    }

    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

module.exports = getIpInfo;
