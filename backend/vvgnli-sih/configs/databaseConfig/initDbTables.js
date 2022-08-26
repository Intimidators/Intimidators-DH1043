const mysql = require("mysql2/promise");
const chalk = require("chalk");
const log = console.log;

const {
  CREATE_ADDRESS_DETAILS_TABLE,
  CREATE_MEDIA_DETAILS_TABLE,
  CREATE_POST_DETAILS_TABLE,
  CREATE_COMMENT_DETAILS_TABLE,
  CREATE_LIKE_DETAILS_TABLE,
  CREATE_USER_DETAILS_TABLE,
  CREATE_WEBINAR_DETAILS_TABLE,
  CREATE_PROFILE_DETAILS_TABLE,
} = require("./DatabaseQueries");

const createDatabaseTables = async () => {
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME || "vvgnli_sih",
  });

  const tableSqlQueries = [
    ["address_details", CREATE_ADDRESS_DETAILS_TABLE],
    ["user_details", CREATE_USER_DETAILS_TABLE],
    ["media_details", CREATE_MEDIA_DETAILS_TABLE],
    ["post_details", CREATE_POST_DETAILS_TABLE],
    ["comment_details", CREATE_COMMENT_DETAILS_TABLE],
    ["like_details", CREATE_LIKE_DETAILS_TABLE],
    ["profile_details", CREATE_PROFILE_DETAILS_TABLE],
  ];

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
