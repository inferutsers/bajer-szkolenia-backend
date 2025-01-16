import getDatabase from "@/connection/database";
import { getConferenceSessionAttendees } from "@/functions/clickmeeting/getConferenceSessionAttendees";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { ADMgetArchivedCourse, ADMgetCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm121000, rm121003, rm121009 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID"),
    meetingSession = headers.get("meetingSession"),
    archive = headers.get("archive")
    if (!sessionID || !courseID || !meetingSession) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = archive === "true" ? (await ADMgetArchivedCourse(db, courseID)) : (await ADMgetCourse(db, courseID))
    if (!course || !course.webinar) { systemLog(systemAction.ADMmeetingAttendees, systemActionStatus.error, rm121000, validatedUser, db); return notFound(rm121000) }
    const conference = course.webinar
    if (!conference?.id) { systemLog(systemAction.ADMmeetingAttendees, systemActionStatus.error, rm121003, validatedUser, db); return unprocessableContent(rm121003) }
    const attendees = await getConferenceSessionAttendees(conference, Number(meetingSession))
    if (!attendees) { systemLog(systemAction.ADMmeetingAttendees, systemActionStatus.error, rm121009, validatedUser, db); return notFound(rm121009) }
    return Response.json(attendees, {status: 200})
}