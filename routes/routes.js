const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const passport = require("passport");

const User = require("../models/user.js");

function loggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).end("Login required");
  }
}

router.get("/ping", (req, res) => {
  res.end("pong");
});

router.get(
  "/interactions",
  [body("user_url").not().isEmpty().trim().escape()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let user_url = req.body.user_url;
    User.findOne({ url: user_url }, "interactions")
      .exec()
      .then((u) => {
        if (u) {
          res.status(200).json(u.interactions);
        } else {
          res.status(404).end("User not found");
        }
      })
      .catch(() => {
        res.status(404).end("User not found");
      });
  }
);

router.get("/profile", loggedIn, (req, res) => {
  let user = req.user;
  User.findById(user.id)
    .select("firstname lastname email url interactions")
    .exec()
    .then((u) => {
      if (u) {
        res.status(200).json(u);
      } else {
        res.status(404).end("User not found");
      }
    })
    .catch(() => {
      res.status(404).end("User not found");
    });
});

// router.post("/addInteraction", loggedIn, (req, res) => {
//
// });

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.status(200).end("logged in");
});

router.post(
  "/signup",
  [
    body("firstname").notEmpty().trim().escape(),
    body("lastname").not().isEmpty().trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("must be at least 8 chars long"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    User.register(
      new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
      }),
      req.body.password,
      function (err, account) {
        if (err) {
          //handle error
          console.log(err);
          res.status(409).end("account exists");
        }
        console.log(account);
        passport.authenticate("local")(req, res, function () {
          //on success
          res.status(201).end("signup successful");
        });
      }
    );
  }
);

router.post("/logout", (req, res) => {
  req.logout();
  res.status(200).end("logged out");
});

module.exports = router;
