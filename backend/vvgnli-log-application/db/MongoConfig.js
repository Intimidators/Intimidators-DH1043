const mongoose = require("mongoose");
const chalk = require("chalk");

const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(chalk.bgGreenBright("Connection established with MongoDB"));
  })
  .catch((err) => {
    console.error(
      chalk.bgRedBright(`Error connecting MongoDB: ${err.message}`)
    );
  });
