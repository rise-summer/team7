const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const Mailer=require('../email/Mailer.js');

const User = require("../models/user.js");
const RequestDB = require("../utilities/RequestDB.js");
const Request=require("../models/request.js");
const requestDB=new RequestDB();


function loggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).end("Login required");
  }
}
//Loading all the pending request's
router.get("/",loggedIn,(req, res) => {
  let user = req.user;
  Request.find({"url":user.url,"tag":"Pending"})
      .then((data) => {
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).end("No Pending Request's");
      }
    })
    .catch(() => {
      res.status(404).end("User not found");
    });
});

//Accepting a request
router.post("/accept",loggedIn, async (req, res) => {
  let user = req.user;
  var requestId=req.body._id;
  var interactionId=req.body.id;
  var email=req.body.email;
  var firstname=req.body.firstname
  //Sending an acceptance Email to the Donor.
  var transporter=Mailer.transporter;

  var mailOptions=Mailer.mailOptions(email,"Interaction Request Accepted ","Hello "+firstname+","+"The fundraiser has accepted your interaction request.Please click on https://calendly.com/spaluri/15min to schedule your appointment.");

  //Getting an array of updated interactions
  var interactions=await requestDB.increaseLimit(user.url,interactionId);
  const update = { interactions: interactions };
  const filter = { url:user.url };
  //Update user
try{
  let doc = await User.findOneAndUpdate(filter, update, {
    new: true
  });
}catch(err)
   {return reject(err);}
//Updating request to accept
   const tag = { tag:"Accepted" };
   const id = { _id:requestId };
   //Update Request
   Request.findByIdAndUpdate(id, { tag: 'Accepted' },
                             function (err, docs) {
     if (err){
          res.status(404).json(err);

     }
     else{
         res.status(200).json(docs);


        // sending an email to the donor
        transporter.sendMail(mailOptions, (error, response) => {
           console.log(mailOptions.to);
         if (error) {
             console.log(error);

         }
         else{console.log("Sent a donor acceptance email"+response.response);}
         });
     }
 });

});

//Rejecting a request
router.post("/reject",loggedIn,async (req, res) => {
  let user = req.user;
  var requestId=req.body._id;
  var interactionId=req.body.id;
  var email=req.body.email;
  var firstname=req.body.firstname;
//Send a rejection Email to the Donor.
var transporter=Mailer.transporter;
var mailOptions=Mailer.mailOptions(email,"Interaction Request Denied ","Sorry "+firstname+","+"The fundraiser at this time is not able to accept youre request.Please try again later.");
// sending an email
transporter.sendMail(mailOptions, (error, response) => {
if (error) {
    console.log(error);

}
else{console.log("Sent a donor email"+response.response);}
});

//Update limit
//Getting an array of updated interactions
try{
var interactions=await requestDB.increaseLimit(user.url,interactionId);
}
catch(err){
  return reject(err);
}
const upd = { interactions: interactions };
const fil = { url:user.url };
//Update user
try{
let doc = await User.findOneAndUpdate(fil, upd, {
  new: true
});
}catch(err)
 {return reject(err);}
//Delete the request
Request.findByIdAndRemove(requestId)
  .exec()
  .then(function(doc) {
       res.status(200).json(doc);
    }).catch(function(error) {
       res.status(404).json("Request not found");
    });

});

router.post("/logout", (req, res) => {
  req.logout();
  res.status(200).end("logged out");
});




module.exports = router;
