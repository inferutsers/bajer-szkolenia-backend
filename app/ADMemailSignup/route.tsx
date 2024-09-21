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

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID"),
    messageSubject = headers.get("messageSubject"),
    messageContent = headers.get("messageContent")
    if (!sessionID || !signupID || !messageSubject || !messageContent) { return badRequest }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signup = await getSignup(db, signupID)
    if (!signup || !signup.courseID) { return notFound }
    const course = await ADMgetCourse(db, signup.courseID)
    if (!course) { return notFound }
    const mailSent = await sendSignupEmail(db, course, utf8.decode(messageSubject), utf8.decode(messageContent), signup)
    if (!mailSent) { return unprocessableContent }
    return NextResponse.json(mailSent, {status: 200})
}