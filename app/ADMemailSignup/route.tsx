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
    if (!signup) { return notFound(rm021000) }
    if (!signup.courseID) { return notFound(rm021001) }
    const course = await ADMgetCourse(db, signup.courseID)
    if (!course) { return notFound(rm021008) }
    const mailSent = await sendSignupEmail(db, course, utf8.decode(messageSubject), utf8.decode(messageContent), signup)
    if (!mailSent) { return unprocessableContent(rm021012) }
    return NextResponse.json(mailSent, {status: 200})
}