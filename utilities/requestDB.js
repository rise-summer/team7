const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Request=require("../models/request.js");
const User=require("../models/user.js");
//All request related functions
class RequestDB{
  //Checking if interaction limit is met for particular interaction of a fundraiser.
checklimit(url,id){
  return new Promise((resolve, reject) => {
        var limit=-1;
        User
       .findOne({url:url},"interactions")
       .then((data) => {

         var interactions=data.interactions;
         console.log(interactions);
      for(var i=0;i<interactions.length;i++){
         if(interactions[i]._id==id){
           limit=interactions[i].limit;
           break;
         }
       }
       if(limit==0){
         resolve(true);
       }
       if(limit==-1||limit>0){
         resolve(false);
       }
           })
         .catch((err) => {
           return reject(err);
         });

 });

}
//Checking if a request already exists and the status of it
 checkTag(url,email,id){
  return new Promise((resolve, reject) => {
    Request.findOne({
    url:url,email:email,id:id},"tag").then((data) =>{
      if(data){

          resolve(data.tag);
      }else{
        resolve("Not Created Yet");
      }

    })
    .catch((err) => {
      return reject(err);
    });

  });
 }
 //Creating a new request
 saveInfo(url,email,id,firstname,lastname){
return new Promise((resolve, reject) => {
let req=new Request({
  tag:"Pending" ,
  url:url,
  //Donor information
  firstname:firstname,
  lastname:lastname,
  //interaction id
   id:id,
  email:email
});

req.save(function (err, data) {
        if (data){ resolve(data);
        console.log("Request Created");}
        else{ return reject(err);}
      });
});
}
//update Limit of interaction after request Created
updateLimit(url,interaction){

  return new Promise((resolve, reject) => {

        User
       .findOne({url:url},"interactions")
       .then((data) => {

         var interactions=data.interactions;

      for(var i=0;i<interactions.length;i++){
         if(interactions[i]._id==interaction){
           interactions[i].limit=interactions[i].limit-1;
           break;
         }
       }
       resolve(interactions);


           })
         .catch((err) => {
           return reject(err);
         });

  });
}
//update Limit of interaction after request Created
increaseLimit(url,interaction){

  return new Promise((resolve, reject) => {

        User
       .findOne({url:url},"interactions")
       .then((data) => {

         var interactions=data.interactions;

      for(var i=0;i<interactions.length;i++){
         if(interactions[i]._id==interaction){
           interactions[i].limit=interactions[i].limit+1;
           break;
         }
       }
       resolve(interactions);


           })
         .catch((err) => {
           return reject(err);
         });

  });
}
}
// export only class with methods to make sure, other part of this app can't modify hardcoded data.
module.exports = RequestDB;
