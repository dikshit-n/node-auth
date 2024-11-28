// create an express router

// module imports
const express = require("express");
const bcrypt = require("bcrypt");

// setup
const router = express.Router();

// services import
const User = require("../models/user.model");

// create user
router.post("/", async (req, res) => {
  console.log(req.body.name);
  console.log(await User.find({ name: req.body.name }));
  // find duplicate user
  try {
    if (await User.findOne({ name: req.body.name })) {
      return res.status(401).json({ message: "User already exists" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }

  // create new user
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      password: hashedPassword,
    });
    await user.save();
    // db.users.push(user);
    return res.send(user).status(201); // created user
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

// list users
router.get("/", async (req, res) => {
  try {
    return res.status(200).json(await User.find());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
