import getDatabase from "@/connection/database"
import { gatherNewsletterEmails } from "@/functions/queries/newsletter"
import sendNewsletterEmail from "@/functions/sendNewsletterEmail"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from 'utf8'

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    subject = headers.get("messageSubject"),
    message = headers.get("messageToSend")
    if (!sessionID || !subject || !message) { return badRequest }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const newsletterEmails = await gatherNewsletterEmails(db)
    if (!newsletterEmails) { return notFound }
    const mailSent = await sendNewsletterEmail(db, utf8.decode(subject), utf8.decode(message), newsletterEmails)
    if (!mailSent) { return unprocessableContent }
    return NextResponse.json(newsletterEmails.length, {status: 200})
}