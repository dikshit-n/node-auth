// auth server

// module imports
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// services import
const db = require("../db");

// setup
const app = express();
app.use(express.json()); // use json
require("dotenv").config();

// authentication

// authentication vs authorization
// authentication: a process of who a user is
// authorization: a process of what a user can do
app.post("/auth/login", (req, res) => {
  const user = db.users.find((el) => el.name === req.body.name);
  if (!user) {
    // user not found
    return res.send("User Not Found").status(404);
  }
  // authenticate
  if (bcrypt.compare(req.body.password, user.password)) {
    // correct user and password
    // create access token for the user for authorization purposes
    const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    return res.send({ name: user.name, access_token });
  } else {
    return res.send("Invalid password").status(400);
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

app.listen(process.env.AUTH_PORT, () =>
  console.log(`Auth Server started at ${process.env.AUTH_PORT}...`)
);

module.exports = {
  authorize,
};
