import getDatabase from "@/connection/database"
import mailFormatAsNewsletterConfirmation from "@/functions/formattings/mailFormatAsNewsletterConfirmation"
import { getNewsletterUserPresenceByConfirmationKey } from "@/functions/queries/newsletter"
import sendSingleEmail from "@/functions/emails/processor/sendSingleEmail"
import { badRequest, notFound, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import fs from 'fs'

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    confirmationKey = headers.get("confirmationKey")
    if (!confirmationKey) { return badRequest }
    const db = await getDatabase(req)
    const isThereAKeyLikeThat = await getNewsletterUserPresenceByConfirmationKey(db, confirmationKey)
    if (!isThereAKeyLikeThat) { return notFound }
    const newsletterUser = await db.query('UPDATE "newsletterUsers" SET "confirmed" = true WHERE "confirmationKey" = $1 RETURNING "email"', [confirmationKey])
    if (!newsletterUser || newsletterUser.rowCount == 0) { return unprocessableContent }
    const url = `https://bajerszkolenia.pl/cancelNewsletter/${confirmationKey}`
    const email = newsletterUser.rows[0].email
    const mailContentHTML = mailFormatAsNewsletterConfirmation(fs.readFileSync("/home/ubuntu/backend/templates/newsletterConfirmation.html", 'utf-8'), email, url),
    mailContentRaw = mailFormatAsNewsletterConfirmation(fs.readFileSync("/home/ubuntu/backend/templates/newsletterConfirmation.txt", 'utf-8'), email, url)
    const mailSent = await sendSingleEmail(email, "Potwierdzenie zapisu do newslettera", mailContentRaw, mailContentHTML)
    if(mailSent.failure == false) {
        await db.query('UPDATE "newsletterUsers" SET "emailsSent" = ARRAY_APPEND("emailsSent", $1) WHERE "confirmationKey" = $2 AND "email" = $3', [mailSent, confirmationKey, email])
    }
    return NextResponse.json(null, {status: 200})
}