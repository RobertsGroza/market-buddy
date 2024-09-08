export interface SSResponse {
    rss: {
        channel: {
            lastBuildDate: string;
            item: SSItem[]
        }
    }
}

export interface SSItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
}

export interface ResultItem {
    title: string;
    description: string;
    link: string;
    timestamp: number;
    parsedDescription: {[key: string]: string}; // parsedDescription is used for filtering
}

export type FilterType = "ss" | "city24";

export interface FilterRecord {
    id: number;
    url: string;
    name: string;
    email: string;
    last_build_timestamp: number;
    type: FilterType;
    filter: string;
}

export interface CustomFilterObject {
    engine: "petrol" | "diesel" | "hybrid";
    maxPrice: number;
}

export interface Filter extends Omit<FilterRecord, "last_build_timestamp"> {
    lastBuildTimestamp: number;
}

export interface ProcessedFilterResult {
    results: ResultItem[];
    lastBuildTimestamp?: number;
}

export interface GroupedResult {
    filter: Filter;
    results: ResultItem[];
}
