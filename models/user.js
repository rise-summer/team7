const mongoose = require("mongoose");
require("mongoose-type-email");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: mongoose.SchemaTypes.Email,
  },
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  usernameUnique: true,
  usernameLowerCase: true,
  limitAttempts: true,
  maxAttempts: 10,
  errorMessages: {
    IncorrectPasswordError: "Username or password is incorrect",
    IncorrectUsernameError: "Username or password is incorrect",
  },
});

module.exports = mongoose.model("User", userSchema);
