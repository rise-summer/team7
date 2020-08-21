db.users.findOneAndUpdate({$and:[{email:'harikapaluri@gmail.com'}]},{$set:{interactions:[{id:2,name:'Resume Review',description:'for free',price:10,limit:10},{id:3,name:'Free chat',description:'for free',price:10,limit:15}]}})





db.users.findOneAndUpdate({$and:[{email:'pls@gmail.com'}]},{$set:{email:'harikapaluri@gmail.com'}})
