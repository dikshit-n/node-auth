// create an express server

// module imports
const express = require("express");
const userRouter = require("../routes/user.route");
const postRouter = require("../routes/post.route");

// setup
const app = express(); // create an express app
app.use(express.json()); // middleware to accept json data
require("dotenv").config(); // configure dotenv

// router
app.use("/user", userRouter);
app.use("/post", postRouter);

// server
app.listen(process.env.PORT, () =>
  console.log(`Server started at ${process.env.PORT}...`)
);
