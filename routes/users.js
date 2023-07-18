
const { Db } = require('mongodb');
var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');
require('dotenv').config();


mongoose.connect("mongodb+srv://useretheharsh2211:"+process.env.MONGO_PASSWORD+"@cluster0.fnvto3x.mongodb.net/?retryWrites=true&w=majority",  {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(function(){
  console.log("Connected to DB");
});


var userSchema = mongoose.Schema({
  name: String,
  email: String,
  mobile: Number,
  address: String,
  postal: Number,
  verified:{
    type: Boolean,
    default: false
  },
  password: String
});

userSchema.plugin(plm, { usernameField: "email" });
module.exports = mongoose.model("user", userSchema);