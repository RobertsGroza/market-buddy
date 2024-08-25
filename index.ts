import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import { XMLParser } from "fast-xml-parser";
import { createTransport } from "nodemailer";

import "dotenv/config";

// TODO: Check if all models are always kebab case (e.g. Alfa Romeo => alfa-romeo)
const filters = [
    ["Golf 7", "transport/cars/volkswagen/golf-7"]
]

const transporter = createTransport({
    service: "gmail",
    auth: {
        user: process.env.email,
        pass: process.env.password
    }
})

const mailOptions = {
    from: process.env.email,
    to: process.env.my_email,
    subject: "Market Buddy",
    text: 'This is a test email sent from a Node.js app!'
}

const parser = new XMLParser();

interface SSResponse {
    rss: {
        channel: {
            item: SSItem[]
        }
    }
}

type SSItem = {
    title: string;
    link: string;
    pubDate: string;
    description: string;
}

axios.get(`https://www.ss.lv/lv/${filters[0][1]}/rss/`)
    .then((response: AxiosResponse<string>) => {
        const data = response.data;
        const result: SSResponse = parser.parse(data);
        const items = result.rss.channel.item;
        for(let item of items) {
            console.log("The car: ", item);
        }
        console.log("email? ", process.env.email);

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
            } else {
                console.log('Email sent: ' + info.response);
            }
        })
    })
    .catch((err: AxiosError) => console.error(err));
 