const mysql = require("mysql2/promise");
const chalk = require("chalk");
const log = console.log;

const { CREATE_MEDIA_DETAILS_TABLE } = require("./DatabaseQueries");

const createDatabaseTables = async () => {
  console.log(process.env.MYSQL_HOST);
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME || "testdb",
  });

  const tableSqlQueries = [["media_details", CREATE_MEDIA_DETAILS_TABLE]];

  tableSqlQueries.forEach(async (query) => {
    await db
      .execute(query[1])
      .then(() => log(chalk.bgGreen(`Table(${query[0]}): ✅`)))
      .catch((err) =>
        log(chalk.bgRed(`Error creating table (${query[0]}): ${err.message}`))
      );
  });
};

module.exports = createDatabaseTables;
