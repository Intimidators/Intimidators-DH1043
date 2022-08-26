const server = require("./server");
const log = console.log;
const chalk = require("chalk");
const PORT = process.env.PORT || 4001;

// database initialization
const database = require("./configs/databaseConfig/database");
database();

const expressServer = server.listen(PORT, () => {
  log(chalk.bgGreenBright(`Server is running on port ${PORT}`));
});

process.on("unhandledRejection", (error) => {
  console.log(
    chalk.bgRedBright.black(`Unhandled Promise Rejection: ${error.message}`)
  );
  console.log(error);
});

process.on("uncaughtException", (error) => {
  console.log(chalk.bgRedBright.black(`Uncaught exception: ${error.message}`));
  console.log(error);
});
