var express = require('express'),
    fs = require('fs'),
    app = express(),
    mongoose = require('mongoose'),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    User = require("./models/user"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    mongodb = require('mongodb'),
    favicon = require('serve-favicon'),
    shortid = require('shortid'),
    path = require('path');

var exec = require('child_process').exec;

app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))

var MongoClient = mongodb.MongoClient;

mongoose.connect("mongodb://localhost/api");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "wah wah wah",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Home get
app.get("/",isLoggedIn,function(req,res){
  res.writeHead(301 ,{Location: '/getAPI'});
  res.end();
});

var url_apiDatabase = 'mongodb://localhost:27017/apiDB';

var url_getResponse = 'mongodb://localhost:27017/getResponse'

// MessageCall GET
app.get('/getResponse/:apikey/:query',function(req,res){

  var api = req.params.apikey;
  var message = req.params.query;

  MongoClient.connect(url_apiDatabase,function(err,db){
    if(err){
      console.log(err);
    }
    else{
      var collection = db.collection('apikey');
      var botResponse = db.collection('botResponse');
      var obj = {
        apikey : api
      }
      collection.find(obj).toArray(function(err,resp){
        if(err){
          console.log(err);
        }
        else if(resp.length == 1){
          var userName = resp[0]['username'];
          var id = resp[0]['_id'];
          var token = api;

          exec('/home/gabru-md/chatterbot-api/chatbot.py',[userName,token,message],(error,stdout,stderr)=>{
            if(error){
              console.log(error);
              return;
            }
            else{
              var botObj = {
                username : userName,
                apitoken : token,
                query : message
              }

              var responseBot = "No Response";

              botResponse.find(botObj).toArray(function(err,Res){
                if(err){
                  console.log(err);
                }
                else{
                  responseBot = Res[0]['response'];
              var responseObj = {
                _id : id,
                username : userName,
                apitoken : token,
                query : message,
                response : responseBot
              }
              res.json(responseObj);
              res.end();
                }
              });  

            }
          });
        }
        else{
          res.render('notfound',{apitoken : api});
          res.end();
        }
      });
    }
  });
});



// getAPI GET
app.get("/getAPI",isLoggedIn,function(req,res){
  //res.writeHead(200,{'Content-Type':'text/html'});
  MongoClient.connect(url_apiDatabase,function(err,db){
    if(err){
      console.log(err);
    }
    else{
      var collection = db.collection('apikey');
      var obj = {
        username : req.user.username
      }

      collection.find({username : req.user.username}).toArray(function(err,resp){
        if(err){
          console.log(err);
        }
        else if(resp.length == 1){
          var api = resp[0]['apikey'];
          res.render('getAPI',{name: req.user.name , apikey: api, disabled : "disabled"});
        }
        else{
          res.render('getAPI',{name: req.user.name , apikey: "Generate API Key", disabled : ""});
        }
      });
    }
    db.close();
  });
  //res.render('getAPI',{name: req.user.name , apikey: "", disabled : "disabled"});
});

// getAPI POST

app.post('/getAPI',isLoggedIn,function(req,res){
  var api = shortid.generate();
  MongoClient.connect(url_apiDatabase,function(err,db){
    if(err){
      console.log(err);
    }
    else{
      var collection = db.collection('apikey')

      var obj = {
        username: req.user.username,
        apikey : api
      }

      collection.insert(obj,function(err,resp){
        if(err){
          console.log(err);
        }
        else{
          console.log('%d apikeys entered!', res.insertedCount);
        }
      });
    }
    db.close();
  });
  res.writeHead(301,{Location : '/getAPI'});
  res.end();
});


// login get

app.get('/login',isLoggedOut,function (req, res) {
	  res.writeHead(200,{'Content-Type':'text/html'});
	  var myInput = fs.createReadStream(__dirname + "/html/login.html");
	  myInput.pipe(res);
});


// How To Use Route

app.get('/howtouse',function(req,res){
  res.writeHead(200,{'Content-Type':'text/html'});
  var myInput = fs.createReadStream(__dirname + "/html/APIuse.html")
  myInput.pipe(res);
});
// docs page

app.get('/docs',function(req,res){
  res.writeHead(301,{Location:"http://chatterbot.readthedocs.io/en/stable/"});
  res.end();
});

// AUTH Routes

//sign up page

app.get("/register", function(req, res) {
    res.writeHead(200,{'Content-Type':'text/html'});
    var myInput = fs.createReadStream(__dirname + "/html/register.html")
    myInput.pipe(res);
});

// register post
app.post("/register", function(req,res){
    User.register(new User({username: req.body.username,name: req.body.name}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.writeHead(200,{'Content-Type':'text/html'});
            var myInput = fs.createReadStream(__dirname + "/html/register.html")
            myInput.pipe(myInput);

        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/login");
        });
    });
});

// LOGIN

app.post("/login", passport.authenticate("local", {
   successRedirect: "/",
   failureRedirect: "/login"
}), function(req, res) {

});

app.get("/logout",function(req, res) {
    req.logout();
    res.redirect("/login");
});

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function isLoggedOut(req,res,next) {
    if(req.isAuthenticated()){
        res.redirect("/login");
    }    
    return next();
}




// Error Route

app.get('/:error',function(req,res){
  res.writeHead(404,{'Content-Type':'text/html'});
  var myInput = fs.createReadStream(__dirname + "/html/error.html");
  myInput.pipe(res);
});


console.log('Crawling on : 8900');
app.listen(8900);
