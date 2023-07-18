
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


var productSchema = mongoose.Schema({
  pname: String,
  pdesc: String,
  price: String,
  pimage: String,
  ptype: {
    type: String,
    required: true,
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  }
 
});

productSchema.plugin(plm);
module.exports = mongoose.model("product", productSchema);