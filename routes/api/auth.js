const express = require("express");
const router = express.Router();
const auths = require("../../middleware/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator/check");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//@route GET api/Auth
//@desc Test route
// @access Public
router.post(
  "/",
  [
    check("email", "please enter valid email address").isEmail(),
    check("password", "password is required").exists()
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: [{ user: "Invalid credetials" }] });
      }

      const isMatch = bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ error: [{ user: "Invalid credetials" }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token: token });
        }
      );
      // return json webtoken

      //  return res.send("User Registered");
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);
router.get("/", auths, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("server error");
  }
});
module.exports = router;
