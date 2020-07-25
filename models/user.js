const mongoose = require("mongoose");
require("mongoose-type-email");
const passportLocalMongoose = require("passport-local-mongoose");
const en = require("nanoid-good/locale/en");
const generate = require("nanoid-good/generate")(en);
const id_alphabet = "2346789ABCDEFGHJKLMNPQRTUVWXYZabcdefghijkmnpqrtwxyz";
// const nanoid = customAlphabet(id_alphabet);
const nanoid = () => generate(id_alphabet, 10);

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  interactions: [
    {
      id: mongoose.ObjectId,
      name: String,
      description: String,
      price: Number,
      limit: Number,
    },
  ],
  url: {
    type: String,
    default: nanoid,
    unique: true,
  },
  email: {
    type: mongoose.SchemaTypes.Email,
    required: true,
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
