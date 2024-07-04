import getDatabase from "@/connection/database"
import { ADMgetCourse } from "@/functions/queries/course"
import { getCourseSignups } from "@/functions/queries/signups"
import sendCourseEmail from "@/functions/sendCourseEmail"
import validateSession from "@/functions/validateSession"
import { bulkEmailReceiver } from "@/interfaces/newsletterReceiver"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from 'utf8'

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID"),
    messageSubject = headers.get("messageSubject"),
    messageContent = headers.get("messageContent")
    if (!sessionID || !courseID || !messageSubject || !messageContent) { return badRequest }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const course = await ADMgetCourse(db, courseID)
    if (!course) { return notFound }
    const courseSingups = await getCourseSignups(db, courseID)
    if (!courseSingups) { return notFound }
    const messageReceivers: bulkEmailReceiver[] = courseSingups.map((result) => ({id: result.id, email: result.email}))
    const mailSent = await sendCourseEmail(db, course, utf8.decode(messageSubject), utf8.decode(messageContent), messageReceivers)
    if (!mailSent) { return unprocessableContent }
    return NextResponse.json(messageReceivers.length, {status: 200})
}