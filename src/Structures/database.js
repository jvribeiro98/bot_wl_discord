const mysql = require('mysql');
require('dotenv').config();

const connect  = mysql.createPool({
    connectionLimit : 10,
    host: process.env.connect,
    user: process.env.userdb,
    port: process.env.port,
    password: process.env.passwordb,
    database: process.env.database,
  });;

module.exports = connect
