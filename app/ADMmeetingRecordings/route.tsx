import getDatabase from "@/connection/database";
import { getConferenceRecordingList } from "@/functions/clickmeeting/getConferenceRecordingList";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { ADMgetCourse } from "@/functions/queries/course";
import { insertMeetingRecordings } from "@/functions/queries/meetingRecordings";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm121000, rm121003, rm121008 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = await ADMgetCourse(db, courseID)
    if (!course || !course.webinar) { systemLog(systemAction.ADMmeetingRecordings, systemActionStatus.error, rm121000, validatedUser, db); return notFound(rm121000) }
    const conference = course.webinar
    if (!conference?.id) { systemLog(systemAction.ADMmeetingRecordings, systemActionStatus.error, rm121003, validatedUser, db); return unprocessableContent(rm121003) }
    const recordings = await getConferenceRecordingList(conference)
    if (!recordings) { systemLog(systemAction.ADMmeetingRecordings, systemActionStatus.error, rm121008, validatedUser, db); return notFound(rm121008) }
    await insertMeetingRecordings(db, recordings)
    return Response.json(recordings.map(recording => ({...recording, url: undefined, relativePath: undefined})), {status: 200})
}