// auth server

// module imports
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// services import
const db = require("../db");
const User = require("../models/user.model");

// setup
const app = express();
app.use(express.json()); // use json
require("dotenv").config();

// authentication

// authentication vs authorization
// authentication: a process of who a user is
// authorization: a process of what a user can do
app.post("/auth/login", async (req, res) => {
  // const user = db.users.find((el) => el.name === req.body.name);
  let user;
  try {
    user = await User.findOne({ name: req.body.name });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  if (!user) {
    // user not found
    return res.status(404).json({ message: "User Not Found" });
  }
  // authenticate
  if (bcrypt.compare(req.body.password, user.password)) {
    // correct user and password
    // create access token for the user for authorization purposes
    const access_token = generateAccessToken({
      name: user.name,
      _id: user._id,
    });
    const refresh_token = jwt.sign(
      { name: user.name, _id: user._id },
      process.env.REFRESH_TOKEN_SECRET
    ); // refreh_token should not have expiry
    // TODO: store in DB
    db.refresh_token.push(refresh_token);
    return res
      .status(200)
      .json({ name: user.name, access_token, refresh_token });
  } else {
    return res.status(400).json({ message: "Invalid password" });
  }
});

// authorization middleware
function authorize(req, res, next) {
  const authorization = req.headers["authorization"];
  const token = authorization?.split(" ")[1];
  if (!token) {
    return res.send("Not Authorized").status(401);
  } else {
    // verify the jwt token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        // system recognizes jwt but refuses to authorize
        return res.send(err).status(403);
      }
      // user is autherized
      req.user = user;
      next();
    });
  }
}

// get new access_token from refresh_token
app.get("/auth/token", (req, res) => {
  const refresh_token = req.headers["refresh_token"];
  if (!refresh_token) return res.sendStatus(401); // unauthorized
  if (!db.refresh_token.includes(refresh_token)) return res.sendStatus(403); // this is a logged out user
  jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      // invalid refresh token
      return res.sendStatus(403); // don't grant access
    }
    return res.status(200).json({
      name: user.name,
      access_token: generateAccessToken({
        name: user.name,
        _id: user._id,
      }),
    });
  });
});

// logout user
app.delete("/auth/logout", (req, res) => {
  db.refresh_token = db.refresh_token.filter(
    (token) => token !== req.body.refresh_token
  );
  return res.sendStatus(204); // succeeded but not content to send
});

// access_token utility
function generateAccessToken(data) {
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "50s",
  });
}

app.listen(process.env.AUTH_PORT, () =>
  console.log(`Auth Server started at ${process.env.AUTH_PORT}...`)
);

module.exports = {
  authorize,
};
