import getDatabase from "@/connection/database"
import mailFormatAsNewsletterCancel from "@/functions/mailFormatAsNewsletterCancel"
import { getNewsletterUserPresenceByConfirmationKey } from "@/functions/queries/newsletter"
import { badRequest, notFound } from "@/responses/responses"
import { NextResponse } from "next/server"
import fs from 'fs'
import sendSingleEmail from "@/functions/sendSingleEmail"

export async function POST(req: Request, res: Response){
    const headers = req.headers
    const confirmationKey = headers.get("confirmationKey")
    if (!confirmationKey) { return badRequest }
    const db = await getDatabase(req)
    const isThereAKeyLikeThat = await getNewsletterUserPresenceByConfirmationKey(db, confirmationKey, true)
    if (!isThereAKeyLikeThat) { return notFound }
    const newsletterUser = await db.query('SELECT "email" FROM "newsletterUsers" WHERE "confirmationKey" = $1 LIMIT 1', [confirmationKey])
    if (!newsletterUser || newsletterUser.rowCount == 0) { return notFound }
    const email = newsletterUser.rows[0].email
    await db.query('DELETE FROM "newsletterUsers" WHERE "confirmationKey" = $1 AND "email" = $2', [confirmationKey, email])
    const mailContentHTML = mailFormatAsNewsletterCancel(fs.readFileSync("/home/ubuntu/backend/templates/newsletterCancel.html", 'utf-8'), email)
    const mailContentRaw = mailFormatAsNewsletterCancel(fs.readFileSync("/home/ubuntu/backend/templates/newsletterCancel.txt", 'utf-8'), email)
    await sendSingleEmail(email, "Rezygnacja z newslettera", mailContentRaw, mailContentHTML)
    return NextResponse.json(null, {status: 200})
}