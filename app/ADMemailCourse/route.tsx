import getDatabase from "@/connection/database"
import { ADMgetCourse } from "@/functions/queries/course"
import sendCourseEmail from "@/functions/emails/sendCourseEmail"
import validateSession from "@/functions/validateSession"
import { bulkEmailReceiver } from "@/interfaces/newsletterReceiver"
import { badRequest, noContent, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from 'utf8'
import { getCourseSignups } from "@/functions/getCourseSignups"
import { rm001000, rm001001, rm011000, rm011001, rm011007 } from "@/responses/messages"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID"),
    messageSubject = headers.get("messageSubject"),
    messageContent = headers.get("messageContent")
    if (!sessionID || !courseID || !messageSubject || !messageContent) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = await ADMgetCourse(db, courseID)
    if (!course) { return notFound(rm011000) }
    const courseSingups = await getCourseSignups(db, courseID)
    if (!courseSingups) { return noContent(rm011001) }
    const messageReceivers: bulkEmailReceiver[] = courseSingups.map((result) => ({id: result.id, email: result.email}))
    const mailSent = await sendCourseEmail(db, course, utf8.decode(messageSubject), utf8.decode(messageContent), messageReceivers)
    if (!mailSent) { return unprocessableContent(rm011007) }
    return NextResponse.json(messageReceivers.length, {status: 200})
}