// module imports
const mongoose = require("mongoose");

// setup
require("dotenv").config();

mongoose.connect(process.env.DATABASE_URL);
const dbe = mongoose.connection;
dbe.on("error", (err) => {
  console.log(err);
});
dbe.on("open", () => {
  console.log("Connected to Datebase");
});

let db = {
  refresh_token: [],
  users: [],
  posts: [],
};

module.exports = db;
