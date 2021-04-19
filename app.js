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
    email: String,
    password: String
  };
  
const User = new mongoose.model("User",userSchema);

app.get("/",function(req,res){
    res.render("login");
  });

app.post("/login", function(req,res){
const emailid = req.body.email;
const pwd = req.body.password;
console.log(emailid,pwd);
User.findOne({email: emailid, password: pwd}, function(err,foundUser){
    if(err){
    console.log(err);
    }
    else{
    if(foundUser){
        sess = req.session;
        sess.email = emailid;
        res.render("login");
        console.log("created",emailid,pwd);
    }
    else{
        res.render("login");
    }
}});
});



app.listen(3000,function(){
console.log("Server started on port 3000.");
});
  
