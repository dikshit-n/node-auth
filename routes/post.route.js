// module imports
const express = require("express");

// setup
const router = express.Router();

// services import
const { authorize } = require("../server/auth.server");
const Post = require("../models/post.model");

// const posts = ["Post 1", "Post 2", "Post 3", "Post 4", "Post 5"];

router.get("/", authorize, async (req, res) => {
  try {
    return res.status(200).json(await Post.find());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
