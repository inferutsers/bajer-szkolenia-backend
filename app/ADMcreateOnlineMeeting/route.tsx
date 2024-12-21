import getDatabase from "@/connection/database";
import { createConference } from "@/functions/clickmeeting/createConference";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { addCourseWebinar, ADMgetCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm121000, rm121001, rm121005 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";

export async function POST(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = await ADMgetCourse(db, courseID)
    if (!course || course.place !== "Online") { systemLog(systemAction.ADMcreateOnlineMeeting, systemActionStatus.error, rm121000, validatedUser, db); return notFound(rm121000) }
    if (course.webinar?.id) { systemLog(systemAction.ADMcreateOnlineMeeting, systemActionStatus.error, rm121005, validatedUser, db); return unprocessableContent(rm121005) }
    const conference = await createConference(course.title, course.instructor, course.date)
    if (!conference) { systemLog(systemAction.ADMcreateOnlineMeeting, systemActionStatus.error, rm121001, validatedUser, db); return unprocessableContent(rm121001) }
    const courseUpdate = await addCourseWebinar(db, course.id, conference)
    if (!courseUpdate) { systemLog(systemAction.ADMcreateOnlineMeeting, systemActionStatus.error, rm121001, validatedUser, db); return unprocessableContent(rm121001) }
    systemLog(systemAction.ADMcreateOnlineMeeting, systemActionStatus.success, `Stworzono webinar dla szkolenia #${course.id}\nID webinaru: ${conference.id}\nURL webinaru: ${conference.url}`, validatedUser, db)
    return Response.json(conference, {status: 200})
}