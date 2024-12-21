import getDatabase from "@/connection/database";
import { generateAttendeeURL } from "@/functions/clickmeeting/generateAttendeeURL";
import { sendExternalUrlsEmail } from "@/functions/emails/sendExternalUrlsEmail";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { addCourseWebinarExternalAttendees, ADMgetCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm121000, rm121003, rm121004 } from "@/responses/messages";
import { badRequest, notFound, unauthorized } from "@/responses/responses";
import utf8 from 'utf8'

export async function POST(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID"),
    attendees = headers.get("attendees"),
    email = headers.get("email")
    if (!sessionID || !attendees || !email || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser || validatedUser.status < 5) { return unauthorized(rm001000) }
    const course = await ADMgetCourse(db, courseID)
    if (!course) { systemLog(systemAction.ADMcreateOnlineMeetingExternalJoinURL, systemActionStatus.error, rm121000, validatedUser, db); return notFound(rm121000) }
    const conference = course.webinar
    if (!conference) { systemLog(systemAction.ADMcreateOnlineMeetingExternalJoinURL, systemActionStatus.error, rm121003, validatedUser, db); return notFound(rm121003) }
    const loginURLs = await generateAttendeeURL(conference, (JSON.parse(utf8.decode(attendees)) as Array<any>).map(attendee => ({name: attendee, email: "uczestnik@bajerszkolenia.pl"})))
    if (!loginURLs) { systemLog(systemAction.ADMcreateOnlineMeetingExternalJoinURL, systemActionStatus.error, rm121004, validatedUser, db); return notFound(rm121004) }
    systemLog(systemAction.ADMcreateOnlineMeetingExternalJoinURL, systemActionStatus.success, `Stworzono link(i) do dołączenia do webinaru dla uczestników zewnętrznych \n${loginURLs.map(url => `${url.name}: ${url.url} (tkn: ${url.token})\n`)}`, validatedUser, db)
    await sendExternalUrlsEmail(course, loginURLs, email)
    await addCourseWebinarExternalAttendees(db, course.id, loginURLs)
    return Response.json(loginURLs, {status: 200})
}