// include nodemailer
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer/lib/smtp-transport')
//const dotenv = require('dotenv');
//dotenv.config();
// declare vars,
const fromMail =process.env.EMAIL_NAME;
let subject = 'Enter subject line here';
let text = "Enter email content."




var transporter = nodemailer.createTransport(new smtpTransport({
  name:'www.raise.social',
  host: process.env.EMAIL_SMTP,
  secure:false,
  port:process.env.EMAIL_PORT,
  auth:{
  user:fromMail,
  pass:process.env.EMAIL_PASS
},
  tls: {rejectUnauthorized: false}

}));


var ops=function setMail(to,subject,text){

	// email options
let mailOptions = {
from: fromMail,
to: to,
subject: subject,
text: text
};
return mailOptions;
}





module.exports.transporter = transporter;
module.exports.mailOptions = ops;
