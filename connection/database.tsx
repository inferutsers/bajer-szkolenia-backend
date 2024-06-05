import { Pool } from "pg";

export default async function getDatabase(): Promise<Pool>{
    const connection = new Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGNAME,
        password: process.env.PGPASSWORD,
        port: Number(process.env.PGPORT)
    })
    return connection
}