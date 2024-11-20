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
    const access_token = generateAccessToken(user);
    const refresh_token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET); // refreh_token should not have expiry
    db.refresh_token.push(refresh_token);
    return res.send({ name: user.name, access_token, refresh_token });
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
    return res
      .send({
        name: user.name,
        access_token: generateAccessToken({
          name: user.name,
          password: user.password,
        }),
      })
      .status(200);
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
