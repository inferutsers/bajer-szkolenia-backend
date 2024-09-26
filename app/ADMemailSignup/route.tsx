import getDatabase from "@/connection/database"
import { ADMgetCourse } from "@/functions/queries/course"
import sendCourseEmail from "@/functions/emails/sendCourseEmail"
import validateSession from "@/functions/validateSession"
import { bulkEmailReceiver } from "@/interfaces/newsletterReceiver"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from 'utf8'
import { getCourseSignups } from "@/functions/getCourseSignups"
import { getSignup } from "@/functions/queries/signups"
import sendSignupEmail from "@/functions/emails/sendSignupEmail"
import { rm001000, rm001001, rm021000, rm021001, rm021008, rm021012 } from "@/responses/messages"
import { systemLog } from "@/functions/logging/log"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID"),
    messageSubject = headers.get("messageSubject"),
    messageContent = headers.get("messageContent")
    if (!sessionID || !signupID || !messageSubject || !messageContent) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID)
    if (!signup) { systemLog(systemAction.ADMemailSignup, systemActionStatus.error, rm021000, validatedUser, db); return notFound(rm021000) }
    if (!signup.courseID) { systemLog(systemAction.ADMemailSignup, systemActionStatus.error, rm021001, validatedUser, db); return notFound(rm021001) }
    const course = await ADMgetCourse(db, signup.courseID)
    if (!course) { systemLog(systemAction.ADMemailSignup, systemActionStatus.error, rm021008, validatedUser, db); return notFound(rm021008) }
    const mailSent = await sendSignupEmail(db, course, utf8.decode(messageSubject), utf8.decode(messageContent), signup)
    if (!mailSent) { systemLog(systemAction.ADMemailSignup, systemActionStatus.error, rm021012, validatedUser, db); return unprocessableContent(rm021012) }
    systemLog(systemAction.ADMemailCourse, systemActionStatus.success, `Wysłano wiadomość\nOdbiorca: ${signup.email}\nTemat: ${messageSubject}\nWiadomość: ${messageContent}`, validatedUser, db);
    return NextResponse.json(mailSent, {status: 200})
}