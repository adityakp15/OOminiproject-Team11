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

// LOGIN PAGE

app.get("/",function(req,res){
    res.render("login");
  });

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login", function(req,res){
const emailid = req.body.email;
const pwd = req.body.password;
let name;
// console.log(emailid,pwd);
User.findOne({email: emailid, password: pwd}, function(err,foundUser){
    if(err){
    console.log(err);
    }
    else{
    if(foundUser){
        sess = req.session;
        sess.email = emailid;
        User.find({email:emailid},function(err,user){
          if(err)
          {
            console.log(err);
          }
        });
        sess.name = foundUser.name;
        console.log(sess.name);
        console.log("rendering dashboard");
        res.render("dashboard",{name:foundUser.name});
        console.log("logged in",emailid,pwd);
    }
    else{
        res.render("login");
    }
    }});
});

// REGISTER PAGE

app.get("/register",function(req,res){
  res.render("register");
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

// DASHBOARD

app.get("/dashboard", function(req , res){
  res.render("dashboard");
  console.log("in dashbaoard");
});
// VIEW PAGE

app.get("/view",function(req,res){
  res.render("view");
  
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
// PAY BALANCE PAGE

app.get("/payBalance",function(req,res){
  res.render("payBalance");
});

// CARD PLANS PAGE

app.get("/cardPlans",function(req,res){
  res.render("cardPlans");
});

// TRANSFER PAGE

app.get("/transfer",function(req,res){
  res.render("transfer");
});

app.get("/admin-plan",function(req,res){
  res.render("admin-plan");
});



app.listen(3000,function(){
console.log("Server started on port 3000.");
});
  
