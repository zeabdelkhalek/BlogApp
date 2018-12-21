var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var PostScheema = new mongoose.Schema({
  title: String,
  author: String,
  text: String
});
UserScheema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Post", PostScheema);
