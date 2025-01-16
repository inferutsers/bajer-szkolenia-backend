import getDatabase from "@/connection/database";
import { getConferenceSessions } from "@/functions/clickmeeting/getConferenceSessions";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { ADMgetArchivedCourse, ADMgetCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm121000, rm121003, rm121008 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID"),
    archive = headers.get("archive")
    if (!sessionID || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = archive === "true" ? (await ADMgetArchivedCourse(db, courseID)) : (await ADMgetCourse(db, courseID))
    if (!course || !course.webinar) { systemLog(systemAction.ADMmeetingSessions, systemActionStatus.error, rm121000, validatedUser, db); return notFound(rm121000) }
    const conference = course.webinar
    if (!conference?.id) { systemLog(systemAction.ADMmeetingSessions, systemActionStatus.error, rm121003, validatedUser, db); return unprocessableContent(rm121003) }
    const sessions = await getConferenceSessions(conference)
    if (!sessions) { systemLog(systemAction.ADMmeetingSessions, systemActionStatus.error, rm121008, validatedUser, db); return notFound(rm121008) }
    return Response.json(sessions, {status: 200})
}