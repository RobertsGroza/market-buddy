import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import { XMLParser } from "fast-xml-parser";

import { sendMail } from './helpers/mailer'
import type { SSResponse } from './types';

// TODO: Check if all models are always kebab case (e.g. Alfa Romeo => alfa-romeo)
const filters = [
    ["Golf 7", "transport/cars/volkswagen/golf-7"]
]
const SEND_MAIL = false;

const parser = new XMLParser();

axios.get(`https://www.ss.lv/lv/${filters[0][1]}/rss/`)
    .then((response: AxiosResponse<string>) => {
        const data = response.data;
        const result: SSResponse = parser.parse(data);
        const items = result.rss.channel.item;
        for(let item of items) {
            console.log("The car: ", item);
        }
        if (SEND_MAIL) {
            sendMail("Market Buddy", "This is a test email");
        }
    })
    .catch((err: AxiosError) => console.error(err));
 