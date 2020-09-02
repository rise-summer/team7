const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const User = require("../models/user.js");

function loggedIn(req, res, next) {
  // if (req.isAuthenticated()) {
  //   next();
  // } else {
  //   res.status(401).end("Login required");
  // }
  passport.authenticate("jwt", function (err, user, _info) {
    if (err) {
      res.status(401).end("Login required");
    }
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    if (user) {
      req.logIn(user, () => {
        next();
      });
    }
  })(req, res, next);
}

router.get(
  "/interactions/:slug",
  [param("slug").not().isEmpty().trim().escape()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let slug = req.param.slug;
    User.findOne(
      { slug: slug },
      "interactions firstname lastname description organization"
    )
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
  }
);

router.get("/profile", loggedIn, (req, res) => {
  let user = req.user;
  User.findById(user._id)
    .select(
      "firstname lastname email url interactions description organization"
    )
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

router.post(
  "/addInteraction",
  [
    body("name").notEmpty().trim().escape(),
    body("description").notEmpty().trim().escape(),
    body("price").isInt({ min: 1 }).toInt(), //price in cents
    body("limit").isInt({ min: 1 }).toInt(),
  ],
  loggedIn,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    User.findByIdAndUpdate(req.user.id, {
      $push: {
        interactions: {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          limit: req.body.limit,
        },
      },
    })
      .then(() => {
        res.status(200).end("added");
      })
      .catch((e) => {
        console.log(e);
        res.status(400).end("failed");
      });
  }
);

router.delete(
  "/deleteInteraction",
  [body("interaction_id").isMongoId()],
  loggedIn,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    User.findByIdAndUpdate(req.user.id, {
      $pull: {
        interactions: { _id: req.body.interaction_id },
      },
    })
      .then(() => {
        res.status(200).end("deleted");
      })
      .catch(() => {
        res.status(400).end("failed");
      });
  }
);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", function (err, user, _info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    if (user) {
      var token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      return res.status(200).json({ token });
    }
  })(req, res, next);
});

router.post(
  "/signup",
  [
    body("firstname").notEmpty().trim().escape(),
    body("lastname").not().isEmpty().trim().escape(),
    body("description").trim().escape(),
    body("organization").notEmpty().trim().escape(),
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
        description: req.body.description,
        organization: req.body.organization,
        email: req.body.email,
      }),
      req.body.password,
      function (err, account) {
        if (err) {
          //handle error
          console.log(err);
          res.status(409).end("Error creating account");
        }
        console.log(account);
        var token = jwt.sign({ id: account._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        return res.status(200).json({ token });
        // passport.authenticate("local")(req, res, function (err, user, _info) {
        //   //on success
        //   if (user) {
        //     var token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        //       expiresIn: "1d",
        //     });
        //     return res.status(200).json({ token });
        //   } else {
        //     return res.status(401).json({ error: "Invalid credentials." });
        //   }
        // });
      }
    );
  }
);

router.post("/logout", (req, res) => {
  req.logout();
  res.status(200).end("logged out");
});

module.exports = router;
