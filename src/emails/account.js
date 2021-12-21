// MODULE
const sgMail = require("@sendgrid/mail");

// API
const sendgridApiKey = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(sendgridApiKey);

// SEND WELCOME MAIL
const welcomeMail = (receiver, name) => {
  const emailSender = process.env.EMAIL_SENDER;
  sgMail.send({
    from: emailSender,
    to: receiver,
    subject: `Welcome to the App! ${name}`,
    text: "Take a look around, let us know what you think",
  });
};

// SEND EXIT MAIL
const exitMail = (receiver, name) => {
  const emailSender = process.env.EMAIL_SENDER;
  sgMail.send({
    from: emailSender,
    to: receiver,
    subject: "Your account has been deleted",
    text: `Thanks for using our App ${name}. Hope to see you again soon!`,
  });
};

module.exports = { welcomeMail, exitMail };
