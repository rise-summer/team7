"use strict";

const express = require("express");

const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const csurf = require('csurf');

mongoose.connect(`mongodb://db:27017/${process.env.DB_NAME}`, {
  auth: {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: "admin",
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // we're connected!
  console.log("connected");
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
let cookie = {
  secure: false,
  maxAge: 2592000000, //30 days
  sameSite: true,
};
if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  cookie.secure = true;
}
app.use(
  session({
    cookie: cookie,
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({ mongooseConnection: db }),
  })
);

/********** PASSPORT MIDDLEWEAR ************/
app.use(passport.initialize());
app.use(passport.session());

const User = require("./models/user.js");
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/********** ROUTES ************/
app.get("/", (req, res) => {
  res.end("hello world");
});

//show fundraiser setup page
//  require logged in
app.get("/interactions", (req, res) => {
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
});

app.post("/login", passport.authenticate("local"), (req, res) => {
  //
  res.end("good");
});

app.post("/signup", (req, res) => {
  User.register(
    new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      url: "TESTING",
    }),
    req.body.password,
    function (err, account) {
      if (err) {
        //handle error
        console.log(err);
        res.end("account exists");
      }
      console.log(account);
      passport.authenticate("local")(req, res, function () {
        //on success
        res.end("nice");
      });
    }
  );
});

app.post("/logout", (req, res) => {
  req.logout();
  res.end("logged out");
});

const server = app.listen(process.env.PORT, function () {
  console.log(`Listening on port: ${process.env.PORT}`);
});
process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  console.log("Closing http server.");
  server.close(() => {
    console.log("Http server closed.");
    mongoose.disconnect().then(() => {
      process.exit(0);
    });
  });
});
