"use strict";

const express = require("express");
/*
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
*/

const app = express();

app.get("/", (req, res) => {
  res.end("hello world");
});

app.listen(process.env.PORT);
