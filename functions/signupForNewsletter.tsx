import { Pool } from "pg";
import { getNewsletterUserPresenceByEmail } from "./queries/newsletter";
import { v4 as uuidv4 } from 'uuid';
import sendNewsletterInvitation from "./emails/sendNewsletterInvitation";

export default async function signupForNewsletter(db: Pool, email: string): Promise<{success: boolean}>{
    const isThereEmailLikeThis = await getNewsletterUserPresenceByEmail(db, email)
    if (isThereEmailLikeThis) { return {success: false} }
    const confirmationKey = uuidv4();
    const newsletterUser = await db.query('INSERT INTO "newsletterUsers"("email", "confirmationKey") VALUES ($1, $2) RETURNING *', [email, confirmationKey])
    if (!newsletterUser || newsletterUser.rowCount == 0) { return { success: false }}
    const newsLetterInvitationStatus = await sendNewsletterInvitation(db, newsletterUser.rows[0].id, email, confirmationKey)
    if (newsLetterInvitationStatus.mailSent == false) { 
        await db.query('DELETE FROM "newsletterUsers" WHERE "id" = $1', [newsletterUser.rows[0].id])
        return { success: false }
    }
    return { success: true }
}