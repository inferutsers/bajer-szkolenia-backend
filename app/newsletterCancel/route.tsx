import getDatabase from "@/connection/database"
import mailFormatAsNewsletterCancel from "@/functions/formattings/mailFormatAsNewsletterCancel"
import { deleteNewsletterUser, getNewsletterUserEmail, getNewsletterUserPresenceByConfirmationKey } from "@/functions/queries/newsletter"
import { badRequest, notFound } from "@/responses/responses"
import { NextResponse } from "next/server"
import fs from 'fs'
import sendSingleEmail from "@/functions/emails/processor/sendSingleEmail"
import { rm001001, rm091001, rm091002 } from "@/responses/messages"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    confirmationKey = headers.get("confirmationKey")
    if (!confirmationKey) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const isThereAKeyLikeThat = await getNewsletterUserPresenceByConfirmationKey(db, confirmationKey, true)
    if (!isThereAKeyLikeThat) { return notFound(rm091001) }
    const email = await getNewsletterUserEmail(db, confirmationKey)
    if (!email) { return notFound(rm091002) }
    await deleteNewsletterUser(db, confirmationKey, email)
    const mailContentHTML = mailFormatAsNewsletterCancel(fs.readFileSync("/home/ubuntu/backend/templates/newsletterCancel.html", 'utf-8'), email),
    mailContentRaw = mailFormatAsNewsletterCancel(fs.readFileSync("/home/ubuntu/backend/templates/newsletterCancel.txt", 'utf-8'), email)
    await sendSingleEmail(email, "Rezygnacja z newslettera", mailContentRaw, mailContentHTML)
    return NextResponse.json(null, {status: 200})
}