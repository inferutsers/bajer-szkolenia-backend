import { Pool } from "pg";

export default async function getDatabase(request?: Request): Promise<Pool>{
    const connection = new Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGNAME,
        password: process.env.PGPASSWORD,
        port: Number(process.env.PGPORT)
    })
    if (request){
        const headers: string[] = []
        request.headers.forEach((value, key) => {
            headers.push(`${key}: ${value}`)
        });
        const currentDate = new Date()
        const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}+${currentDate.getTimezoneOffset()}`
        connection.query('INSERT INTO "log_requests"("date", "headers", "url", "method", "session") VALUES ($1, $2, $3, $4, $5)', [currentDateFormatted, headers, (new URL(request.url)).pathname.slice(1), request.method, request.headers.get("sessionID")])
    }
    return connection
}