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
let name;

app.get("/",function(req,res){
    res.render("login");
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
        console.log(sess);
        sess.email = emailid;
        User.find({email:emailid},function(err,user){
          if(err)
          {
            console.log(err);
          }
        });
        sess.name = foundUser.name;
        const name = sess.name;
        console.log(name);
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
        dob : req.body.date,
        address : req.body.address
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
  res.render("dashboard",{name:sess.name});
  console.log("in dashboard");
  console.log(name);
});
// VIEW PAGE

app.get("/view",function(req,res){
  sess = req.session;
  const name = sess.name;
  console.log("in view");
User.findOne({name:name},function(err,foundUser){
    if(err){
      console.log(err)
    }
    else{
      if(foundUser)
      {
        const name = foundUser.name;
        const address = foundUser.address;
        const email = foundUser.email;
        const aadhar = foundUser.aadhar;
        const sex = foundUser.sex;
        const dob = foundUser.dob;
        date = new Date(dob);
        // console.log(date.getFullYear()+'-' + (date.getMonth()+1) + '-'+date.getDate());
        const dob2 = date.getDate() + '-' + (date.getMonth()+1)  +'-' +date.getFullYear();
        res.render("view",{name:name,email:email,address:address,aadhar:aadhar,sex:sex,dob:dob2});
      }
      // console.log(user.name,user.sex,user.address);
      // res.render("view",{name:user.name,email:user.email,address:user.address,aadhar:user.aadhar,sex:user.sex,dob:user.dob});
    }
    // res.render("view",{name:user.name,email:user.email,address:user.address,aadhar:user.aadhar,sex:user.sex,dob:user.dob});
  });
  
  
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
  
