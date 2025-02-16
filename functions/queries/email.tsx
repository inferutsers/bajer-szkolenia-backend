import { emailQueueElement } from "@/interfaces/emailQueueElement";
import { Pool } from "pg";

export async function getEmailQueueElement(db: Pool): Promise<emailQueueElement | undefined>{
    const result = await db.query(`SELECT * FROM "email_queue" LIMIT 1`)
    if (!result?.rowCount) { return undefined }
    return formatAsEmailQueueElement(result.rows[0])
}

function formatAsEmailQueueElement(row: any): emailQueueElement{
    return {
        id: row.id, 
        subject: row.subject, 
        text: row.text, 
        html: row.html, 
        from: row.from,
        to: row.to, 
        cc: row.cc, 
        bcc: row.bcc, 
        attachments: row.attachments, 
        attachmentFileNames: row.attachmentFileNames
    }
}