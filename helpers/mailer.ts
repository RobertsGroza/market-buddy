import fs from "fs";
import { createTransport } from "nodemailer";
import "dotenv/config";

import { config } from "../config";
import { FilterType, GroupedResult } from "../types";

const transporter = createTransport({
    service: "gmail",
    auth: {
        user: process.env.email,
        pass: process.env.password,
    },
});

const baseOptions = {
    from: process.env.email,
    to: process.env.my_email,
};

export function sendMail(subject: string, content: string): void {
    const options = {
        ...baseOptions,
        subject: subject,
        html: content,
    };

    transporter.sendMail(options, (err, info) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
}

type Templates = {
    [key in FilterType]: string;
} & {
    email: string;
};

function readAllTemplates(): Templates {
    const emailTemplate = fs.readFileSync("templates/template.html", "utf-8");
    const ssTemplate = fs.readFileSync(
        "templates/ssItemTemplate.html",
        "utf-8",
    );
    const city24Template = fs.readFileSync(
        "templates/cityItemTemplate.html",
        "utf-8",
    );

    return {
        email: emailTemplate,
        ss: ssTemplate,
        city24: city24Template,
    };
}

export function composeAndSendEmail(groupedResults: GroupedResult[]): void {
    const templates = readAllTemplates();
    let templateBody = "";
    let itemCount = 0;

    for (const { results, filter } of groupedResults) {
        templateBody += `<h2 class="filter-name">${filter.name}</h2>`;

        for (const item of results) {
            let itemTemplate = templates[filter.type];

            itemTemplate = itemTemplate.replace("{{title}}", item.title);
            itemTemplate = itemTemplate.replace(
                "{{description}}",
                item.description,
            );

            templateBody += itemTemplate;
            itemCount += 1;
        }
    }

    const emailContent = templates.email.replace("{{template}}", templateBody);

    if (config.sendMail) {
        sendMail(`${itemCount} new items`, emailContent);
    }
}
