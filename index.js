"use strict";

const express = require("express");

const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

mongoose.connect("mongodb://db:27017/platform", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
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
    saveUnitialized: false,
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

app.listen(process.env.PORT);
