import fs from 'fs';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
  
    },
});

function sendEmail(subject, message) {
    const recipients = [
       
    ];

    const mailOptions = {
        from: 'bizonancesystemerrors@gmail.com',
        to: recipients,
        subject,
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error(`[EMAIL ERROR]: ${error}`);
        else console.log(`[EMAIL SENT]: ${info.response}`);
    });
}

export function logInfo(message) {
    console.log(`[INFO]: ${message}`);
    fs.appendFileSync('logs.txt', `[INFO]: ${message}\n`);
}

export function logError(error) {
    console.error(`[ERROR]: ${error}`);
    fs.appendFileSync('logs.txt', `[ERROR]: ${error}\n`);
    sendEmail('CI/CD Pipeline Error', error);
}
