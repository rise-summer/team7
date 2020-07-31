const mongoose = require("mongoose");
require("mongoose-type-email");
const passportLocalMongoose = require("passport-local-mongoose");
//const en = require("nanoid-good/locale/en");
//const generate = require("nanoid-good/generate")(en);
const id_alphabet = "2346789ABCDEFGHJKLMNPQRTUVWXYZabcdefghijkmnpqrtwxyz";
// const nanoid = customAlphabet(id_alphabet);
//const nanoid = () => generate(id_alphabet, 10);

const requestSchema = new mongoose.Schema({
  requestId:mongoose.ObjectId,
tag:{
  type:String,
  required:true,
},
fundraiserEmail:{
  type:String,
  required:true,
},
//Donor information
firstname: {
  type: String,
  required: true,
},
lastname: {
  type: String,

},

//interaction name
 name:{
   type:String,
   required:true
 },

email: {
  type: mongoose.SchemaTypes.Email,
  required: true,
}
});
module.exports = mongoose.model("Request",requestSchema);
