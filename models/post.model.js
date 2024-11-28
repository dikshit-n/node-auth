const mongoose = require("mongoose");

const Post = mongoose.model(
  "Post",
  new mongoose.Schema({
    title: String,
    description: String,
  })
);

module.exports = Post;
