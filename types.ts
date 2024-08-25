export interface SSResponse {
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
