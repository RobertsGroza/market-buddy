import { config } from "./config";
import { sendMail } from "./helpers/mailer";
import { DB } from "./helpers/db";
import { processFilter } from "./helpers/ssFilter";
import { ProcessedFilterResult } from "./types";


async function main() {
    const db = new DB();
    const filters = await db.getFilters();

    for (const filter of filters) {
        const result =
            filter.type === "ss"
                ? await processFilter(filter)
                : ({} as ProcessedFilterResult); // TODO: Add City24 filter

        if (result.lastBuildTimestamp) {
            db.updateLastEntry(filter.id, result.lastBuildTimestamp);
        }

        if (config.sendMail) {
            sendMail("Market Buddy", "This is a test email");
        }
    }

    db.close();
}

main();
