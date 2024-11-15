// create an express server

const express = require("express"); // import express library
const bcrypt = require("bcrypt");

const app = express(); // create an express app
app.use(express.json()); // middleware to accept json data

const users = [];

// user
// create user
app.post("/user", (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const user = {
      name: req.body.name,
      password: hashedPassword,
    };
    users.push(user);
    return res.send(user).status(201);
  } catch (err) {
    return res.send(err).status(500);
  }
});

// list users
app.get("/user", (req, res) => {
  res.send(users);
  return res.status(200);
});

// authentication
app.post("/login", (req, res) => {
  // authenticate the user
  const user = users.find((user) => user.name === req.body.name);
  if (!user) {
    return res.send("User Not Found").status(400);
  }
  try {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      return res.send(user).status(200);
    } else {
      return res.send("Invalid Password").status(400);
    }
  } catch (err) {
    res.send(err).status(500);
  }
});

const posts = ["Post 1", "Post 2", "Post 3", "Post 4"];

app.get("/posts", (req, res) => {
  console.log("/posts route called");
  res.send(posts);
});

app.listen(5000, () => console.log("Server started at 5000..."));
