import getDatabase from "@/connection/database"
import { deleteConference } from "@/functions/clickmeeting/deleteConference"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { ADMgetCourse, eraseCourseWebinar } from "@/functions/queries/course"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm121000, rm121006 } from "@/responses/messages"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"

export async function DELETE(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = await ADMgetCourse(db, courseID)
    if (!course || course.place !== "Online" || !course.webinar?.id) { systemLog(systemAction.ADMdeleteOnlineMeeting, systemActionStatus.error, rm121000, validatedUser, db); return notFound(rm121000) }
    const webinarDeletion = await deleteConference(course.webinar.id)
    if (!webinarDeletion) { systemLog(systemAction.ADMdeleteOnlineMeeting, systemActionStatus.error, rm121006, validatedUser, db); return unprocessableContent(rm121006) }
    const webinarRecordDeletion = await eraseCourseWebinar(db, course.id)
    if (!webinarRecordDeletion) { systemLog(systemAction.ADMdeleteOnlineMeeting, systemActionStatus.error, rm121006, validatedUser, db); return unprocessableContent(rm121006) }
    return Response.json(null, {status: 200})
}