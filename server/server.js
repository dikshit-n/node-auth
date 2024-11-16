// create an express server

// module imports
const express = require("express");
const bcrypt = require("bcrypt");

// services import
const { authorize } = require("./auth.server");
const db = require("../db");

// setup
const app = express(); // create an express app
app.use(express.json()); // middleware to accept json data
require("dotenv").config(); // configure dotenv

// user
// create user
app.post("/user", (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const user = {
      name: req.body.name,
      password: hashedPassword,
    };
    db.users.push(user);
    // set({ users: [...get().users, user] });
    // const data = get().users;
    return res.send(user).status(201);
  } catch (err) {
    return res.send(err).status(500);
  }
});

// list users
app.get("/user", (req, res) => {
  return res.send(db.users).status(200);
});

const posts = ["Post 1", "Post 2", "Post 3", "Post 4"];

app.get("/posts", authorize, (req, res) => {
  res.send(posts).status(200);
});

app.listen(process.env.PORT, () =>
  console.log(`Server started at ${process.env.PORT}...`)
);
