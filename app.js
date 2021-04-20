//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');

var sess;

const app = express();

app.set('view engine','ejs');

app.use(express.static("public"));
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.urlencoded({
  extended:true
}));

mongoose.connect("mongodb://localhost:27017/ccDB");

const userSchema = {
    name : String,
    email: String,
    password: String,
    address : String,
    aadhar : String,
    dob : Date,
    sex : String
  };
  
const detailSchema = {
  
}
const User = new mongoose.model("User",userSchema);

app.get("/",function(req,res){
    res.render("payBalance");
  });

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login", function(req,res){
const emailid = req.body.email;
const pwd = req.body.password;
// console.log(emailid,pwd);
User.findOne({email: emailid, password: pwd}, function(err,foundUser){

    if(err){
    console.log(err);
    }
    else{
    if(foundUser){
        sess = req.session;
        sess.email = emailid;
        res.render("login");
        console.log("logged in",emailid,pwd);
    }
    else{
        res.render("login");
    }
    }});
});

app.post("/register", function(req,res){
    console.log("a mass");
    const newUser = new User({
        email : req.body.email,
        password : req.body.password,
        name : req.body.name,
        aadhar : req.body.aadhar,
        sex : req.body.sex,
        dob : req.body.date
      });
      console.log(req.body.email,req.body.password,req.body.name,req.body.aadhar,req.body.sex,req.body.dob);
      newUser.save(function(err){
        if(err){
          res.send(err);
        }
        else{
          res.render("register");
        }
      });
    });

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/view",function(req,res){
  res.render("view");
});

app.get("/payBalance",function(req,res){
  res.render("payBalance");
});

app.post("/search", function(req,res){
  const aadhar = req.body.aadhar;
  sess = req.session;
  User.findOne({aadhar:aadhar}, function(err,foundAadhar){
    if(err){
      console.log(err);
    }
    else{
      if(foundAadhar){
        const name = foundAadhar.name;
        const email = foundAadhar.email;
        const sex = foundAadhar.sex;
        console.log(name,email,sex);
        
      }
      else{
        res.render("details",{ecode:0});
      }
    }
  })
});

app.get("/payBalance",function(req,res){
  res.render("payBalance")

})
app.listen(3000,function(){
console.log("Server started on port 3000.");
});
  
