const { Pool } = require("pg");

const isTest = process.env.NODE_ENV === "test"; // zasebna baza za testiranje

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: isTest ? "loyalty_card_test" : process.env.DATABASE,
});
pool.connect().then(() => console.log("connected"));

module.exports = pool;
