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