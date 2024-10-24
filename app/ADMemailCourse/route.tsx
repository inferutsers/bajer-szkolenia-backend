import getDatabase from "@/connection/database"
import { ADMgetCourse } from "@/functions/queries/course"
import sendCourseEmail from "@/functions/emails/sendCourseEmail"
import validateSession from "@/functions/validateSession"
import { bulkEmailReceiver } from "@/interfaces/newsletterReceiver"
import { badRequest, noContent, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from 'utf8'
import { rm001000, rm001001, rm011000, rm011001, rm011007 } from "@/responses/messages"
import { systemLog } from "@/functions/logging/log"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"
import { getCourseSignups } from "@/functions/queries/signups"

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
    if (!course) { systemLog(systemAction.ADMemailCourse, systemActionStatus.error, rm011000, validatedUser, db); return notFound(rm011000) }
    if (course.permissionRequired > validatedUser.status) { systemLog(systemAction.ADMemailCourse, systemActionStatus.error, rm001000, validatedUser, db); return unauthorized(rm001000) }
    const courseSingups = await getCourseSignups(db, courseID)
    if (!courseSingups) { systemLog(systemAction.ADMemailCourse, systemActionStatus.error, rm011001, validatedUser, db); return noContent(rm011001) }
    const messageReceivers: bulkEmailReceiver[] = courseSingups.map((result) => ({id: result.id, email: result.email}))
    const mailSent = await sendCourseEmail(db, course, utf8.decode(messageSubject), utf8.decode(messageContent), messageReceivers)
    if (!mailSent) { systemLog(systemAction.ADMemailCourse, systemActionStatus.error, rm011007, validatedUser, db); return unprocessableContent(rm011007) }
    systemLog(systemAction.ADMemailCourse, systemActionStatus.success, `Wysłano wiadomość\nOdbiorcy: ${messageReceivers.map((receiver) => (receiver.email)).join(", ")}\nTemat: ${messageSubject}\nWiadomość: ${messageContent}`, validatedUser, db);
    return NextResponse.json(messageReceivers.length, {status: 200})
}