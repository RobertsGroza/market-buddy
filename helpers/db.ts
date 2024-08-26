import { Database } from 'sqlite3';

export function createDatabase(): void {
    const db = new Database("./filters.db", (err) => console.error(err));

    db.exec(`
        CREATE TABLE filters (
            id  INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            type TEXT CHECK(type IN ('ss','city24')) NOT NULL DEFAULT "ss",
            last_entry_time INTEGER,
            last_id TEXT,
            email TEXT
        );
    `);

    db.exec(`
        INSERT INTO filters (name, url)
        VALUES ("GOLF 7", "transport/cars/volkswagen/golf-7");
    `);
}

export function checkEntries(): void {
    const db = new Database("./filters.db", (err) => console.error(err));

    db.all("SELECT * FROM filters", (err, rows) => {
        for(let row of rows) {
            console.log({ row });
        }
    });
}

export function updateLastRecord(id: string, timestamp: number): void {
    const db = new Database("./filters.db", (err) => console.error(err));

    db.exec(`
        UPDATE filters
        SET last_id = "${id}", last_entry_time = ${timestamp}
        WHERE filters.name = "GOLF 7";
    `);
}
