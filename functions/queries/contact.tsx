import { contactMessage } from "@/interfaces/contactMessage";
import { Pool } from "pg";
import { getDateLong } from "../dates";

export async function getContactMessages(db: Pool): Promise<contactMessage[] | undefined>{
    const messages = await db.query('SELECT * FROM "contact" ORDER BY "date" DESC')
    if (!messages || messages.rowCount == 0) { return undefined }
    return messages.rows.map((result) => formatAsContactMessageElement(result))
}

export async function insertContactMessage(db: Pool, message: string, email: string){
    await db.query('INSERT INTO "contact"("email", "message", "date") VALUES ($1, $2, $3)', [email, message, getDateLong()])
}

export function formatAsContactMessageElement(row: any): contactMessage{
    return {id: row.id, email: row.email, message: row.message, date: row.date}
}