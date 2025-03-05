import fs from 'fs';
import nodemailer from 'nodemailer';

// Track last email sent to avoid spamming
const lastEmailSent = {};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Use environment variables
        pass: process.env.EMAIL_PASSWORD,
    },
});

function sendEmail(subject, message) {
    const recipients = [
        'shantanugote82@gmail.com',
        'aniketsd1998@gmail.com',
        'info@bizonance.in',
        'manjotarale@gmail.com',
        'fat12abc@gmail.com',
        'ingalechinmay318@gmail.com',
    ];

    const mailOptions = {
        from: process.env.EMAIL_USER,
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

export function logError(error, severity = 'critical') {
    console.error(`[ERROR]: ${error}`);
    fs.appendFileSync('logs.txt', `[ERROR]: ${error}\n`);

    // Only send email for critical errors and avoid spamming
    if (severity === 'critical') {
        const EMAIL_COOLDOWN = 3600000; // 1 hour
        const lastSent = lastEmailSent[error] || 0;

        if (Date.now() - lastSent > EMAIL_COOLDOWN) {
            sendEmail('CI/CD Pipeline Error', error);
            lastEmailSent[error] = Date.now();
        }
    }
}