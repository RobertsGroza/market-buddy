import "dotenv/config";
import { Database } from "sqlite3";

import { Filter, FilterRecord } from "../types";

export class DB {
    private db: Database;

    constructor() {
        const db_name = process.env.db_name ?? "database.db";

        this.db = new Database(db_name, (err) => {
            if (err) {
                console.error(err);
            }
        });
    }

    public getFilters(): Promise<Filter[]> {
        return new Promise<Filter[]>((resolve, reject) => {
            this.db.all(
                "SELECT * FROM filters",
                (err, rows: FilterRecord[]) => {
                    if (err) {
                        this.createFiltersTable()
                            .then((result) => resolve(result))
                            .catch((err) => reject(err));
                    } else {
                        resolve(
                            rows.map((row) => ({
                                ...row,
                                lastBuildTimestamp: row.last_build_timestamp,
                            })),
                        );
                    }
                },
            );
        });
    }

    public updateLastEntry(
        filter_id: number,
        lastBuildTimestamp: number,
    ): void {
        this.db.exec(
            `
            UPDATE filters
            SET last_build_timestamp = ${lastBuildTimestamp}
            WHERE filters.id = ${filter_id};
        `,
            (err) => {
                if (err) {
                    console.error(err.message);
                }
            },
        );
    }

    public close(): void {
        this.db.close();
    }

    private createFiltersTable(): Promise<Filter[]> {
        return new Promise((resolve, reject) => {
            this.db.exec(
                `
                CREATE TABLE filters (
                    id  INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    url TEXT NOT NULL,
                    type TEXT CHECK(type IN ('ss','city24')) NOT NULL DEFAULT "ss",
                    last_build_timestamp INTEGER,
                    email TEXT
                );

                INSERT INTO filters (name, url, email)
                VALUES (
                    "GOLF 7",
                    "https://www.ss.lv/lv/transport/cars/volkswagen/golf-7/rss/",
                    "${process.env.my_email}"
                );
            `,
                (err) => {
                    if (err) {
                        reject("CREATE_FILTERS_ERROR");
                    } else {
                        this.db.all(
                            "SELECT * FROM filters",
                            (err, rows: FilterRecord[]) => {
                                if (err) {
                                    reject("SELECT_FILTERS_ERROR");
                                } else {
                                    resolve(
                                        rows.map((row) => ({
                                            ...row,
                                            lastBuildTimestamp:
                                                row.last_build_timestamp,
                                        })),
                                    );
                                }
                            },
                        );
                    }
                },
            );
        });
    }
}
