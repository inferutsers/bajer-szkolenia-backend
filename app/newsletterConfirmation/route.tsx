import getDatabase from "@/connection/database"
import mailFormatAsNewsletterConfirmation from "@/functions/formattings/mailFormatAsNewsletterConfirmation"
import { addEmailSentToNewsletterUser, confirmNewsletterUser, getNewsletterUserPresenceByConfirmationKey } from "@/functions/queries/newsletter"
import sendSingleEmail from "@/functions/emails/processor/sendSingleEmail"
import { badRequest, notFound, unprocessableContent } from "@/responses/responses"
import fs from 'fs'
import { rm001001, rm091001, rm091003 } from "@/responses/messages"

export async function POST(req: Request){
    const headers = req.headers,
    confirmationKey = headers.get("confirmationKey")
    if (!confirmationKey) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const isThereAKeyLikeThat = await getNewsletterUserPresenceByConfirmationKey(db, confirmationKey)
    if (!isThereAKeyLikeThat) { return notFound(rm091001) }
    const url = `https://bajerszkolenia.pl/cancelNewsletter/${confirmationKey}`
    const email = await confirmNewsletterUser(db, confirmationKey)
    if (!email) { return unprocessableContent(rm091003) }
    const mailContentHTML = mailFormatAsNewsletterConfirmation(fs.readFileSync("/home/ubuntu/backend/templates/newsletterConfirmation.html", 'utf-8'), email, url),
    mailContentRaw = mailFormatAsNewsletterConfirmation(fs.readFileSync("/home/ubuntu/backend/templates/newsletterConfirmation.txt", 'utf-8'), email, url)
    const mailSent = await sendSingleEmail(email, "Potwierdzenie zapisu do newslettera", mailContentRaw, mailContentHTML)
    if(mailSent.failure == false) {
        await addEmailSentToNewsletterUser(db, confirmationKey, email, mailSent)
    }
    return Response.json(null, {status: 200})
}