import { contactMessage } from "@/interfaces/contactMessage";
import { Pool } from "pg";

export async function getContactMessages(db: Pool): Promise<contactMessage[] | undefined>{
    const messages = await db.query('SELECT * FROM "contact"')
    if (!messages || messages.rowCount == 0) { return undefined }
    return messages.rows.map((result) => formatAsContactMessageElement(result))
}

export function formatAsContactMessageElement(row: any): contactMessage{
    return {id: row.id, email: row.email, message: row.message, date: row.date}
}