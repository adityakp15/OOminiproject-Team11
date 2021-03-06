//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const _ = require("lodash");
const { toArray } = require("lodash");

var sess;

const app = express();

app.set('view engine','ejs');

app.use(express.static("public"));
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.urlencoded({
  extended:true
}));

mongoose.connect("mongodb+srv://admin-ccps:admin@cluster0.ocxae.mongodb.net/ccDB?");
// mongoose.connect("mongodb://localhost:27017/ccDB");

const userSchema = {
    name : String,
    email: String,
    password: String,
    address : String,
    aadhar : String,
    dob : Date,
    sex : String,
    card: {
      number : Number,
      cvv : Number,
      plan : String,
      status : String,
      balance : Number
    }
};

const User = new mongoose.model("User",userSchema);

const planSchema = {
  allowance : Number,
  interest: Number,
  name: String,
  id: String
};

const Plan = new mongoose.model("Plan", planSchema);


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
if(emailid === "admin@ccps.com" && pwd === "admin")
{
  res.render("admin-dash");
}
else{
  User.findOne({email: emailid, password: pwd}, function(err,foundUser)
  {
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
   }
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
  sess = req.session;
  const name = sess.name;
  res.render("dashboard",{name:name});
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
        const cardPlan = foundUser.card.plan;
        const status = foundUser.card.status;
        const cardno = foundUser.card.number;
        const cvv = foundUser.card.cvv;
        console.log(cardPlan,status);
        // console.log(date.getFullYear()+'-' + (date.getMonth()+1) + '-'+date.getDate());
        const dob2 = date.getDate() + '-' + (date.getMonth()+1)  +'-' +date.getFullYear();
        res.render("view",{name:name,email:email,address:address,aadhar:aadhar,sex:sex,dob:dob2,plan:cardPlan,status:status,cardno:cardno,cvv:cvv});
      }
      else{
        console.log("session error");
        res.render("error",{err:"session"});
      }
      // console.log(user.name,user.sex,user.address);
      // res.render("view",{name:user.name,email:user.email,address:user.address,aadhar:user.aadhar,sex:user.sex,dob:user.dob});
    }
    // res.render("view",{name:user.name,email:user.email,address:user.address,aadhar:user.aadhar,sex:user.sex,dob:user.dob});
  });



});


// PAY BALANCE PAGE

app.get("/payBalance",function(req,res){
  sess = req.session;
  const mail = sess.email;
  if(mail==null || mail==undefined){
    console.log("session error");
    res.render("error",{err:"session"});
  }

  User.findOne({email:mail},function(err,foundUser){
    if(err)
      console.log(err);
    else
    {
      if(!foundUser.card.plan){
        res.render("error",{err:"plan"});
      }
      Plan.findOne({id:foundUser.card.plan},function(err,foundPlan){
        if(foundPlan)
        {
          console.log(foundUser);
          const bal = parseInt(foundUser.card.balance);
          const allowance = parseInt(foundPlan.allowance);
          const amount = allowance - bal;
          const interest = parseInt(foundPlan.interest);
          const total = amount + ((interest/100)*amount);
          res.render("payBalance",{amount:amount,interest:interest,total:total});
        }
        else{
          console.log("not found plan");
          res.render("error",{err:"plan"});
        }

      });

    }

  });

});

app.post("/payBalance",function(req,res){
  sess = req.session;
  const mail = sess.email;
  if(mail==null || mail==undefined){
    console.log("session error");
    res.render("error",{err:"session"});
  }
  User.findOne({email:mail},function(err,foundUser){
    if(err)
      console.log(err);
    else
    {
      if(!foundUser.card.plan){
        res.render("error",{err:"plan"});
      }
      Plan.findOne({id:foundUser.card.plan},function(err,foundPlan){
        if(foundPlan)
        {
          console.log("found plan");
          const allowance = parseInt(foundPlan.allowance);
          User.updateOne({email:mail},{'card.balance':allowance}).exec((err,user) => {
            if(err)
              console.log(err);
              else{
                console.log(user);
                res.redirect("/dashboard");
              }
        });
      }
      else{
        console.log("not found plan");
        res.render("error",{err:"plan"});
      }

      });

      }

  });
});
// CARD PLANS PAGE

app.get("/viewplan",function(req,res){
  Plan.find({}, function(err, foundPlans){
    sess = req.session;
    const mail = sess.email;
    if(mail==null || mail==undefined){
      res.render("error",{err:"session"});
    }
    User.findOne({email:mail},function(err,foundUser){
      if(foundUser){
        const foundID = foundUser.card.plan;
        res.render("cardPlans",{plans: foundPlans,id:foundID});
      }
      else{
        console.log("session error");
        res.render("error",{err:"session"});
      }
    });

  });
});

// TRANSFER PAGE

app.get("/transfer",function(req,res){
  console.log("in transfer");
  res.render("transfer");
});

app.post("/transfer",function(req,res){
  amt = parseInt(req.body.amount);
  cvv = req.body.cvv;
  accno = req.body.accno;
  console.log(amt,cvv,accno);

  sess = req.session;
  const mail = sess.email;
  if(mail==null || mail==undefined){
    res.render("error",{err:"session"});
  }
  User.findOne({'card.cvv':cvv,'email':mail},function(err,foundUser){
    if(foundUser){
      if(amt>parseInt(foundUser.card.balance)){
        res.render("error",{err:"insufficientBal"})
      }
      else{
        const deduc = parseInt(foundUser.card.balance) - amt;
        console.log(deduc);
        User.updateOne({'card.cvv':cvv},{'card.balance':deduc}).exec((err,user) => {
          if(err)
            console.log(err);
            else{
              console.log(user)
            }
            User.findOne({'card.number':accno},function(err,foundUser){
              const amot = parseInt(foundUser.card.balance) + amt;
              console.log(amot);
              User.updateOne({'card.number':accno},{'card.balance':amot}).exec((err,user) => {
                if(err)
                  console.log(err);
                  else{
                    console.log(user);
                    res.render("transfer");
                  }
              });
            });
        });
      }
    }
    else{
      res.render("error",{err:"cvv"});
    }
  });

});
app.get("/addplan",function(req,res){
  res.render("add-plan");
});

app.get("/delplan",function(req,res){
  Plan.find({}, function(err, foundPlans){
    res.render("del-plan",{plans: foundPlans});
  });
});

app.get("/approve",function(req,res){
  User.find({"card.status":"Inactive"},function(err, foundUsers){
    res.render("approve",{users: foundUsers});
  });
});

app.post("/addplan", function(req,res){
  const newPlan = new Plan({
      name : req.body.inputPlanName,
      id : req.body.inputPlanID,
      allowance : req.body.inputAllowance,
      interest : req.body.inputInterestRate
  });
  newPlan.save(function(err){
    if(err){
      res.send(err);
    }
    else{
      res.render("add-plan");
    }
  });
});

app.get("/logout", function(req,res){
  req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        console.log("Session destroyed successfully");
        res.redirect('/');
  });
});

// CARD CATALOG
app.get("/cardPlans",function(req , res){
  res.render("cardPlans");

});

// ADMIN STUFFS
app.get("/admin-dash",function(req,res){
  res.render("admin-dash");
});

//terminate PAGE
app.get("/terminate",function(req,res)
{
  sess = req.session;
  const mail = sess.email;
  if(mail==null || mail==undefined){
      console.log("session error");
      res.render("error",{err:"session"});
  }
  console.log(mail);
  User.updateOne({email:mail},{"card.plan":null,"card.status":null,"card.number":null,"card.cvv":null,"card.balance":null}).exec((err, posts) => {
    if(err)
      console.log(err)
    else{
      console.log(posts);
    }
    res.redirect("/view");
  })
})

//keep this function at the end !!!!
app.get("/:url", function(req,res){
  const url = _.capitalize(req.params.url);

  newUrl = url.slice(0, 4);
  arg = url.slice(4,);
  console.log(newUrl, arg);
  if(newUrl == "Plan")
  {
    //const mail = "a@b.com";
    sess = req.session;
    const mail = sess.email;
    if(mail==null || mail==undefined){
        console.log("session error");
        res.render("error",{err:"session"});
    }
    Plan.findOne({id : arg},function(err,foundPlan){
      if(foundPlan){
        const balance = foundPlan.allowance;
        console.log(balance,foundPlan.allowance,foundPlan.id);
        User.updateOne({email:mail},{ 'card.plan' : arg , 'card.status' : 'Inactive' , 'card.balance' : balance}).exec((err, posts) => {
          if(err)
            console.log(err);
          else
            console.log(posts);
          res.redirect("/view");
        });
      }
    });

  }
  else if(newUrl == "Appr")
  {
    const cvv = Math.floor(Math.random()*(999-100+1)+100);
    const cardNum = Math.floor(Math.random()*(9999999999-1000000000+1)+1000000000);

    User.updateOne({aadhar:arg},{'card.status' : 'Active' , 'card.cvv' : cvv , 'card.number' : cardNum}).exec((err, posts) => {
      if(err)
        console.log(err)
      else
        console.log(posts)
      User.find({"card.status":"Inactive"},function(err, foundUsers){
        res.render("approve",{users: foundUsers});
      });
    })
  }
  else if(newUrl == "Decl")
  {
    User.updateOne({aadhar:arg},{'card.status' : null , 'card.cvv' : null , 'card.number' : null, 'card.balance':null,'card.plan':null}).exec((err, posts) => {
      if(err)
        console.log(err)
      else
        console.log(posts)
      User.find({"card.status":"Inactive"},function(err, foundUsers){
        res.render("approve",{users: foundUsers});
      });
    })
  }
  else if(newUrl == "Dele")
  {
    Plan.findOneAndRemove({id:arg}).exec((err, posts) => {
      if(err)
        console.log(err)
      else
        console.log(posts)
        Plan.find({}, function(err, foundPlans){
          res.render("del-plan",{plans: foundPlans});
        });
    });
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.set("port",port);

app.listen(port,function(){
console.log("Server started successfully.");
});
