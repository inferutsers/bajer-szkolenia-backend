import { newsletterMessage } from "@/interfaces/newsletterMessage";
import { newsletterReceiver } from "@/interfaces/newsletterReceiver";
import { Pool } from "pg";

export async function getNewsletterUserPresenceByEmail(db: Pool, email: string): Promise<Boolean>{
    const newsletterUser = await db.query('SELECT "id" FROM "newsletterUsers" WHERE "email" = $1 LIMIT 1', [email])
    if (!newsletterUser || newsletterUser.rowCount == 0) { return false }
    return true
}
export async function getNewsletterUserPresenceByConfirmationKey(db: Pool, key: string, confirmed: boolean = false): Promise<Boolean>{
    const newsletterUser = await db.query('SELECT "id" FROM "newsletterUsers" WHERE "confirmationKey" = $1 AND "confirmed" = $2 LIMIT 1', [key, confirmed])
    if (!newsletterUser || newsletterUser.rowCount == 0) { return false }
    return true
}
export async function gatherNewsletterEmails(db: Pool): Promise<newsletterReceiver[] | undefined>{
    const newsletterUsers = await db.query('SELECT "id", "email" FROM "newsletterUsers" WHERE "confirmed" = TRUE')
    if (!newsletterUsers || newsletterUsers.rowCount == 0) { return undefined }
    return newsletterUsers.rows.map((result) => ({id: result.id, email: result.email}))
}
export async function getNewsletterMessages(db: Pool): Promise<newsletterMessage[] | undefined>{
    const newsletterMessages = await db.query('SELECT * FROM "newsletterMessages"')
    if (!newsletterMessages || newsletterMessages.rowCount == 0) { return undefined }
    return newsletterMessages.rows.map((result) => ({id: result.id, receiversAmount: result.receivers.length, message: result.message.html}))
}