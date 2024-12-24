import getDatabase from "@/connection/database";
import { getConferenceSessionChat } from "@/functions/clickmeeting/getConferenceSessionChat";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { ADMgetCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm121000, rm121003, rm121010 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID"),
    meetingSession = headers.get("meetingSession")
    if (!sessionID || !courseID || !meetingSession) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = await ADMgetCourse(db, courseID)
    if (!course || !course.webinar) { systemLog(systemAction.ADMmeetingChat, systemActionStatus.error, rm121000, validatedUser, db); return notFound(rm121000) }
    const conference = course.webinar
    if (!conference?.id) { systemLog(systemAction.ADMmeetingChat, systemActionStatus.error, rm121003, validatedUser, db); return unprocessableContent(rm121003) }
    const chat = await getConferenceSessionChat(Number(meetingSession))
    if (!chat) { systemLog(systemAction.ADMmeetingChat, systemActionStatus.error, rm121010, validatedUser, db); return notFound(rm121010) }
    return Response.json(chat, {status: 200})
}