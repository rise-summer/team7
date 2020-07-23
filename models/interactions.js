const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema({
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

module.exports = mongoose.model("Interactions", interactionSchema);
