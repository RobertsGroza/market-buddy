import { createTransport } from "nodemailer";

import "dotenv/config";

const transporter = createTransport({
    service: "gmail",
    auth: {
        user: process.env.email,
        pass: process.env.password
    }
})

const baseOptions = {
    from: process.env.email,
    to: process.env.my_email,
}

export function sendMail(subject: string, content: string): void {
    const options = {
        ...baseOptions,
        subject: subject,
        text: content,
    }
    
    transporter.sendMail(options, (err, info) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
}
