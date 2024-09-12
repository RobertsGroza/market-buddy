import cron from "node-cron";

import { composeAndSendEmail } from "./helpers/mailer";
import { DB } from "./helpers/db";
import { processFilter } from "./helpers/ssFilter";
import { GroupedResult, ProcessedFilterResult } from "./types";

async function main() {
    const db = new DB();
    const filters = await db.getFilters();
    const groupedResult: GroupedResult[] = [];

    for (const filter of filters) {
        const result =
            filter.type === "ss"
                ? await processFilter(filter)
                : ({ results: [] } as ProcessedFilterResult);

        groupedResult.push({
            filter: filter,
            results: result.results,
        });

        if (result.lastBuildTimestamp) {
            db.updateLastEntry(filter.id, result.lastBuildTimestamp);
        }
    }

    composeAndSendEmail(groupedResult);
    db.close();
}

// Run every minute
cron.schedule("*/1 * * * *", () => main());
