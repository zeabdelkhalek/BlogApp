/*
* # Blog App
* https://github.com/AbdelkhalekESI
* Zellat Abdelkhalek
* Copyright 2018
*/
var port = process.env.PORT || 3000 ;

var alrt = 0 ;
var express = require("express") ,
app = express() ,
bodyParser = require("body-parser") ,
mongoose = require("mongoose")  ,
methodoverride = require("method-override") ,
    passport = require("passport") ,
    flash = require ("connect-flash")  ,
    fileUpload = require('express-fileupload') ,
    LocalStrategy = require("passport-local") ,
    mailer = require('express-mailer'),
  passportLocalMongoose = require("passport-local-mongoose") ,
    User = require("./models/user") ;

 //mongoose.connect("mongodb://localhost/Blog");
 mongoose.connect("mongodb://blogapp:cse2008@ds159400.mlab.com:59400/blogapp");
// mongoose.connect("mongodb://abdou:cse2008@ds247330.mlab.com:47330/testcse");
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());

app.use('/' , express.static('public'));
mailer.extend(app, {
  from: 'no-reply@example.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'ha_zellat@esi.dz',
    pass: '20171782'
  }
});
app.use(methodoverride("_method"));
app.set("view engine"  , "ejs") ;
app.use(flash()) ;

var CommentScheema = new mongoose.Schema({
   name : String ,
   content : String 
}) ;
var Comment = mongoose.model("Comment" , CommentScheema ) ;

var BlogSheema = new mongoose.Schema({
   title : String ,
    author : String ,
    authorID : String ,
   image : String ,
   body : String ,
   comments : [CommentScheema] ,
   created : {type : Date , default : Date.now}
}) ;

var Blog = mongoose.model("Blog" , BlogSheema) ;


app.use(require("express-session")({
    secret : "Sceintific Club Of ESI" ,
    resave : false ,
    saveUninitialized : false
})) ;

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req,res,next) {
    res.locals.currentUser = req.user ;
    res.locals.success = req.flash("success") ;
    res.locals.error = req.flash("error") ;
    next() ;
})



app.get("/" , function (req,res) {
   res.render("home") ;
   //console.log(req.user.username) ;
})



 /* */


app.get("/blogs"  , function(req,res) {
Blog.find({} , function(err ,Blogs) {
   if(err) {
       req.flash("error" , err) ;
   }
   else {
       res.render("index" , { Blogs : Blogs }) ;
   }
})
})

app.post("/new" , function (req,res) {
    Blog.create( req.body.blog , function (err , createdBlog) {
        if(err) { req.flash("error" , err)} else {
        createdBlog.author = req.user.username ;
        createdBlog.authorID = req.user._id ;
        createdBlog.save() ; }
    }) ;
    req.flash("success" , "A new blog has been added") ;
    res.redirect("/blogs") ;
})

app.get("/blogs/new" , IsLoggedIn , function (req,res) {
           res.render("new") ;
})

app.get("/blogs/register" , function (req,res) {
    res.render("register") ;
})

app.post("/register" , function (req,res) {
    /*req.body.username
    req.body.password*/
    User.register(new User ({username : req.body.username }) ,  req.body.password , function (err , user ) {
        if (err) {
            console.log(err) ;
            req.flash("error" , err.message)
           return res.render("register") ;
        }
        passport.authenticate("local")(req,res,function () {
            req.flash("success" , " Welcome To BlogApp  " +  user.username) ;
            app.mailer.send('mail', {
              to: req.body.mail , // REQUIRED. This can be a comma delimited string just like a normal email to field.
              subject: 'Welcome To BlogApp', // REQUIRED.
              otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
            }, function (err) {
              if (err) {
                // handle error
                console.log(err);
                //res.send('There was an error sending the email');
                return;
              }
              // res.send('Email Sent');
            });
            res.redirect("/blogs") ;
            });
    });





});

app.get("/blogs/login" , function (req,res) {
    res.render("login") ;
})

app.post("/login" ,passport.authenticate("local" , {
    failureRedirect : "/blogs/login" ,
    failureFlash : " Invalid username or password " ,
    successRedirect : "/blogs" ,
    successFlash : "Welcome !  "  ,

}), function (req,res) {
});

app.get("/blogs/logout" , function (req,res) {

    req.flash("success" , " GoodBye  !  " + req.user.username) ;
    req.logout() ;
    res.redirect("/blogs") ;
});



app.get("/blogs/:id"  ,function (req,res) {
   Blog.findById( req.params.id , function (err , foundBlog) {
       if(err) {
           req.flash("error" , err.message) ;
           res.redirect("/blogs")} else {
           res.render("show" , {blog : foundBlog , req : req })

       }
   })
})

app.get("/blogs/:id/edit" , function (req,res) {
   Blog.findById(req.params.id , function (err , foundBlog) {
       if ( err) {
           req.flash("error" , err.message) ;
           res.redirect("/blogs") } else {
           res.render("edit" , {Blog : foundBlog })
       }
   })

})


app.put("/blogs/:id" ,  function(req,res) {

    if ( req.isAuthenticated()) {
        Blog.findById(req.params.id  , function(err, foundBlog) {
            if (req.user._id == foundBlog.authorID ) {
                Blog.findByIdAndUpdate( req.params.id , req.body.blog , function (err , updatedBlog ) {
                    if (err) {
                        req.flash("error" , err.message) ;
                        res.redirect("/blogs")} else {
                        req.flash("success" , "The blog has been edited") ;
                        res.redirect("/blogs/"+req.params.id) ;


                    }
                })
            } else {

                res.send("YO DON'T HAVE PERMISSION TO DO THAT !!") ;
            }
        })

    } else {
        res.send("YOU NEED TO BE LOGGED IN TO DO THAT !! ") ;
    }

})


app.delete("/blogs/:id" ,  function(req,res) {

    if ( req.isAuthenticated()) {
        Blog.findById(req.params.id  , function(err, foundBlog) {
            if (req.user._id == foundBlog.authorID ) {
                Blog.findByIdAndRemove(req.params.id , function() {
                    req.flash("success" , "The blog has been deleted") ;
                    res.redirect("/blogs");
                })
            } else {

                req.flash("error"," You don't have permission to do that ") ;
                res.redirect("/blogs") ;
            }
        })

    } else {
       req.flash("error","You need to be logged in to do that") ;
        res.redirect("/blogs") ;
        }

})

app.post("/blogs/:id/comment" ,IsLoggedIn ,  function (req,res) {
   Blog.findById( req.params.id , function (err , foundBlog) {
       if(err) { req.flash("error" , err.message)} else {

           foundBlog.comments.push({ name : req.user.username  , content : req.body.comment})  ;
		foundBlog.save(); 
          req.flash("success" , "Successfully added comment")

           }
   })

   res.redirect("/blogs/"+req.params.id) ;
})

function IsLoggedIn (req , res , next) {
  if(req.isAuthenticated()) {
      return next() ;
      }
    req.flash("error" , "You need to be logged in to do that") ;
      res.redirect("/blogs/login") ;
}

app.listen(port , () => console.log("SERVER HAS STARTED , CHECK  " + port)) ;
