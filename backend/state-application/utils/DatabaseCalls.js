const chalk = require("chalk");
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB_NAME || "testdb",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

exports.makeDbCall = async (query, params) => {
  try {
    return db
      .query(query, params)
      .then((res) => {
        return { success: true, response: res, status: 200 };
      })
      .catch((err) => {
        console.log(err);
        return { success: false, message: err.message, status: 400 };
      });
  } catch (err) {
    console.error(chalk.bgRedBright(`${query} to DB failed: ${err.message}`));

    return {
      success: false,
      message: err.message,
      status: 500,
    };
  }
};
