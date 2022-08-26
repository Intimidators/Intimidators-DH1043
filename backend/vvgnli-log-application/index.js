const app = require("./server");
const chalk = require("chalk");

const PORT = process.env.PORT || 5000;
require("./db/MongoConfig");

const expressApp = app.listen(PORT, () => {
  console.log(
    chalk.bgGreen.blackBright(`Log application is listening on ${PORT}`)
  );
});
