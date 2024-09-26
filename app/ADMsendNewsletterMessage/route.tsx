import getDatabase from "@/connection/database"
import { gatherNewsletterEmails } from "@/functions/queries/newsletter"
import sendNewsletterEmail from "@/functions/emails/sendNewsletterEmail"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from 'utf8'
import { rm001000, rm001001, rm081000, rm081001 } from "@/responses/messages"
import { systemLog } from "@/functions/logging/log"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"

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
    if (!newsletterEmails) { systemLog(systemAction.ADMsendNewsletterMessage, systemActionStatus.error, rm081000, validatedUser, db); return notFound(rm081000) }
    const mailSent = await sendNewsletterEmail(db, utf8.decode(subject), utf8.decode(message), newsletterEmails)
    if (!mailSent) { systemLog(systemAction.ADMsendNewsletterMessage, systemActionStatus.error, rm081001, validatedUser, db); return unprocessableContent(rm081001) }
    systemLog(systemAction.ADMsendNewsletterMessage, systemActionStatus.success, `Wysłano wiadomość newslettera\nOdbiorcy: ${newsletterEmails.map((email) => email.email).join(", ")}\nTemat: ${subject}\nWiadomość: ${message}`, validatedUser, db);
    return NextResponse.json(newsletterEmails.length, {status: 200})
}