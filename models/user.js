var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserScheema = new mongoose.Schema({
  username: String,
  password: String
});
UserScheema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserScheema);
