import getDatabase from "@/connection/database"
import { gatherNewsletterEmails } from "@/functions/queries/newsletter"
import sendNewsletterEmail from "@/functions/emails/sendNewsletterEmail"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from 'utf8'
import { rm001000, rm001001, rm081000, rm081001 } from "@/responses/messages"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    subject = headers.get("messageSubject"),
    message = headers.get("messageToSend")
    if (!sessionID || !subject || !message) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const newsletterEmails = await gatherNewsletterEmails(db)
    if (!newsletterEmails) { return notFound(rm081000) }
    const mailSent = await sendNewsletterEmail(db, utf8.decode(subject), utf8.decode(message), newsletterEmails)
    if (!mailSent) { return unprocessableContent(rm081001) }
    return NextResponse.json(newsletterEmails.length, {status: 200})
}