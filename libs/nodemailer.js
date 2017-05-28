/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
 /* 
   ================================
   ===       MODULE NAME       ====
   ================================ 
*/

'use strict';

const nodemailer = require('@nodemailer/pro');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp-relay.gmail.com',
    port: 25,
    auth: {
        user: 'aleksandrovkm@gmail.com',
        pass: 'Matvey2009'
    }
});


module.exports = (from, to, subject, text, html, attachments) => {

    // setup email data with unicode symbols
    let mailOptions = {
        // from: '"Konstantin Aleksandrov 👻" <aleksandrovkm@gmail.com>', // sender address
        from: from ? from : '"Konstantin Aleksandrov" <aleksandrovkm@gmail.com>', // sender address
        to: Array.isArray(to) ? to.join(', ') : to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html, // html body
        watchHtml: html,
    };

    if (attachments && Array.isArray(attachments)) mailOptions.attachments = attachments;

    return new Promise((resolve, reject) => {
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            } else {
                resolve({ messageId: info.messageId, response: info.response })
            }
        });
    });

};