var mysql = require("mysql");
var config = require("../config");

var connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.username,
  password: config.database.password,
  database: config.database.database
});

connection.connect(err => {
  if (err) throw err;
  console.log("DB Connection established");
});

module.exports = connection;
