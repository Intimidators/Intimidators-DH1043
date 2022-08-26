const chalk = require("chalk");
const mysql = require("mysql2/promise");
const { CREATE_DB_IF_NOT_EXISTS_QUERY } = require("./DatabaseQueries");
const createDatabaseTables = require("./initDbTables");
const log = console.log;
const error = console.error;
const initDatabase = async () => {
  try {
    const db = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
    });

    await db.execute(CREATE_DB_IF_NOT_EXISTS_QUERY);
    await createDatabaseTables();
    log(chalk.bgGreenBright(`Connection established with DB 🎉🥳`));
  } catch (err) {
    console.log(err);
    error(chalk.bgRedBright(`Error connecting DB: ${err.message}`));
  }
};

module.exports = initDatabase;
