/*
* # Blog App
* https://github.com/AbdelkhalekESI
* Zellat Abdelkhalek
* Copyright 2018 Contributors



*/

var express = require("express") ;
var app = express() ;
var bodyParser = require("body-parser");
var mongoose = require("mongoose") ;
var methodoverride = require("method-override") ;
mongoose.connect("mongodb://localhost/Blog");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(methodoverride("_method"));

app.set("view engine"  , "ejs") ;
var CommentScheema = new mongoose.Schema({
   name : String ,
   content : String ,
})

var Comment = mongoose.model("Comment" , CommentScheema ) ;

var BlogSheema = new mongoose.Schema({
   title : String ,
   image : String ,
   body : String ,
   comments : [CommentScheema] ,
   created : {type : Date , default : Date.now}
})



var Blog = mongoose.model("Blog" , BlogSheema) ;

app.get("/" , function (req,res) {
   res.redirect("/blogs");
})
app.get("/blogs" , function(req,res) {
Blog.find({} , function(err ,Blogs) {
   if(err) {
       res.send("error") ;
   }
   else {
       res.render("index" , { Blogs : Blogs}) ;
   }
})
})
app.post("/new" , function (req,res) {

   Blog.create( req.body.blog ) ;
   res.redirect("/blogs") ;
})

app.get("/blogs/new" , function (req,res) {
           res.render("new") ;
})

app.get("/blogs/:id"  ,function (req,res) {
   Blog.findById( req.params.id , function (err , foundBlog) {
       if(err) { res.redirect("/blogs")} else {
           res.render("show" , {blog : foundBlog})
       }
   })
})

app.get("/blogs/:id/edit" , function (req,res) {
   Blog.findById(req.params.id , function (err , foundBlog) {
       if ( err) { res.redirect("/blogs") } else {
           res.render("edit" , {Blog : foundBlog })
       }
   })

})

app.put("/blogs/:id" , function (req,res) {
   Blog.findByIdAndUpdate( req.params.id , req.body.blog , function (err , updatedBlog ) {
       if (err) { res.redirect("/blogs")} else { res.redirect("/blogs/"+req.params.id)}
   })
})


app.delete("/blogs/:id" , function(req,res) {
   Blog.findByIdAndRemove(req.params.id , function() {
res.redirect("/blogs") ;
   })
})

app.post("/blogs/:id/comment" , function (req,res) {
   Blog.findById( req.params.id , function (err , foundBlog) {
       if(err) { console.log(err)} else {
           foundBlog.comments.push(req.body.comment)  ;
           foundBlog.save() ;
       }
   })

   res.redirect("/blogs/"+req.params.id) ;
})



app.listen(3000 , () => console.log("SERVER HAS STARTED IN PORT 3000")) ;