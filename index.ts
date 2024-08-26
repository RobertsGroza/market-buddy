import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import { XMLParser } from "fast-xml-parser";

import { sendMail } from './helpers/mailer';
import { checkEntries, createDatabase } from "./helpers/db";
import type { SSResponse } from './types';

const SEND_MAIL = false;

const parser = new XMLParser();

axios.get(`https://www.ss.lv/lv/transport/cars/volkswagen/golf-7/rss/`)
    .then((response: AxiosResponse<string>) => {
        const data = response.data;
        const result: SSResponse = parser.parse(data);
        const items = result.rss.channel.item;
        console.log(items);
        if (SEND_MAIL) {
            sendMail("Market Buddy", "This is a test email");
        }
        // createDatabase();
        checkEntries();
    })
    .catch((err: AxiosError) => console.error(err));
 