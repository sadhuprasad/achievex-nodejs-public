const dotenv = require("dotenv");
const mysql = require("mysql");
dotenv.config({ path: "./.env" });
const DB = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true,
});
if(DB){
    console.log(`db connection successfull`);
}else{
    console.log(`db connection error`);
}
module.exports = DB;

