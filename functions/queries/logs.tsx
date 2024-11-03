import { logElement } from "@/interfaces/logElement";
import { Pool } from "pg";

export async function getLogs(db: Pool): Promise<logElement[] | undefined>{
    const results = await db.query(`
        SELECT
        "administrator",
        "action",
        "status",
        "message",
        "date"
        FROM
        "logs"
        ORDER BY "date" DESC
        LIMIT 500
        `)
    if (!results?.rowCount) { return undefined }
    return results.rows.map(row => formatAsLogElement(row))
}

export function formatAsLogElement(row: any): logElement{
    return { id: row.id, administrator: row.administrator, action: row.action, status: row.status, message: row.message, date: row.date }
}