const mongoose = require("mongoose");

// mongoose model interacts directly with database using the schema
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    password: String,
  })
);

module.exports = User;
