import axios from "axios";
import { XMLParser } from "fast-xml-parser";

import { config } from "../config";
import type {
    CustomFilterObject,
    Filter,
    ProcessedFilterResult,
    ResultItem,
    SSItem,
    SSResponse,
} from "../types";

export async function processFilter(
    filter: Filter,
): Promise<ProcessedFilterResult> {
    const parser = new XMLParser();

    try {
        const response = await axios.get<string>(filter.url);
        const parsedData: SSResponse = parser.parse(response.data);

        return {
            results: applySSFilters(
                processSSItems(parsedData.rss.channel.item, filter),
                filter,
            ),
            lastBuildTimestamp: new Date(
                parsedData.rss.channel.lastBuildDate,
            ).getTime(),
        };
    } catch (err) {
        console.error(err);

        return {
            results: [],
        };
    }
}

export function processSSItems(items: SSItem[], filter: Filter): ResultItem[] {
    const newItems =
        config.filterByTime && filter.lastBuildTimestamp
            ? items.filter(
                  (item) =>
                      new Date(item.pubDate).getTime() >
                      filter.lastBuildTimestamp,
              )
            : items;

    return newItems.map((item) => {
        return {
            title: item.title,
            description: item.description,
            link: item.link,
            timestamp: new Date(item.pubDate).getTime(),
            parsedDescription: parseDescription(item),
        };
    });
}

function applySSFilters(items: ResultItem[], filter: Filter): ResultItem[] {
    const customFilter: CustomFilterObject = JSON.parse(filter.filter);

    return items.filter((item) => {
        for (const [filterKey, filterValue] of Object.entries(customFilter)) {
            const itemPrice = parseInt(
                (item.parsedDescription["Cena"] ?? "").replace(",", "").match(/\d+/g)?.[0] ?? "0",
                10,
            );
            const isDiesel = (item.parsedDescription["Tilp."] ?? "").match(/d|D/g,);

            if (!itemPrice || (filterKey === "maxPrice" && itemPrice > filterValue)) {
                return false;
            }
            if (
                filterKey === "engine" &&
                filterValue === "petrol" &&
                isDiesel
            ) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Parses SS item description to ojbect that can be processed
 * @param item Item with description
 * @returns object containing values (e.g. {cena: "3,000 EUR"})
 */
function parseDescription(item: SSItem): { [key: string]: string } {
    const descriptionParameters =
        item.description.match(/(\w|[.])+: <b>([^//])+/g) ?? [];
    const keyValuePairs = descriptionParameters.map((el) =>
        el.replace(/<b>|</g, "").split(": "),
    );

    return Object.fromEntries(keyValuePairs);
}
