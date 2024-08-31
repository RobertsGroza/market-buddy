import axios from "axios";
import { XMLParser } from "fast-xml-parser";

import { config } from "../config";
import type {
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
            results: processSSItems(parsedData.rss.channel.item, filter),
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
    const newItems = config.filterByTime && filter.lastBuildTimestamp
        ? items.filter(
              (item) =>
                  new Date(item.pubDate).getTime() > filter.lastBuildTimestamp,
          )
        : items;

    return newItems.map((item) => {
        return {
            title: item.title,
            description: item.description,
            link: item.link,
            timestamp: new Date(item.pubDate).getTime(),
        };
    });
}
