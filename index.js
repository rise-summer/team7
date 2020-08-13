"use strict";

const express = require("express");

const passport = require("passport");
// const session = require("express-session");
// const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
// const csurf = require('csurf');

mongoose.connect(`mongodb://db:27017/${process.env.DB_NAME}`, {
  auth: {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: "admin",
  useFindAndModify: false,
  useCreateIndex: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const server = require("http").createServer(app);

// app.use(cors({ credentials: true, origin: "http://localhost:19006" }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// let cookie = {
//   secure: false,
//   maxAge: 2592000000, //30 days
//   sameSite: true,
// };
// if (app.get("env") === "production") {
//   app.set("trust proxy", 1);
//   cookie.secure = true;
// }
// app.use(
//   session({
//     cookie: cookie,
//     resave: false,
//     saveUninitialized: false,
//     secret: process.env.SESSION_SECRET,
//     store: new MongoStore({ mongooseConnection: db }),
//   })
// );

/********** PASSPORT MIDDLEWEAR ************/
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

app.use(passport.initialize());
// app.use(passport.session());

const User = require("./models/user.js");
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(
  "jwt",
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme("JWT"),
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwt_payload, done) => {
      User.findOne({
        _id: jwt_payload.id,
      })
        .then((user) => {
          if (user) {
            done(null, user);
          } else {
            done(null, false);
          }
        })
        .catch((err) => {
          return done(err, false);
        });
    }
  )
);

/********** ROUTES ************/
const routes = require("./routes/routes.js");
app.use("/", routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error handler
if (process.env.NODE_ENV !== "production") {
  // development error handler
  // will print stacktrace
  app.use(function (err, req, res, _next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err,
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, _next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: {},
    });
  });
}

db.once("open", function () {
  // we're connected!
  console.log("connected");
  server.listen(process.env.PORT, function () {
    console.log(`Listening on port: ${process.env.PORT}`);
  });
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
