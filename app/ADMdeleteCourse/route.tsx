import getDatabase from "@/connection/database";
import { deleteConference } from "@/functions/clickmeeting/deleteConference";
import { dumpObject, systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { ADMgetCourse, deleteCourse } from "@/functions/queries/course";
import { getCourseSignups } from "@/functions/queries/signups";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm011000, rm011002, rm011012 } from "@/responses/messages";
import { badRequest, notFound, serviceUnavailable, unauthorized, unprocessableContent } from "@/responses/responses";

export async function DELETE(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser || validatedUser.status < 5) { return unauthorized(rm001000) }
    const course = await ADMgetCourse(db, courseID)
    if (!course) { systemLog(systemAction.ADMdeleteCourse, systemActionStatus.error, rm011000, validatedUser, db); return notFound(rm011000) }
    if (!course.available) { systemLog(systemAction.ADMeditCourse, systemActionStatus.error, rm011012, validatedUser, db); return serviceUnavailable(rm011012) }
    if (course.permissionRequired > validatedUser.status) { systemLog(systemAction.ADMdeleteCourse, systemActionStatus.error, rm001000, validatedUser, db); return unauthorized(rm001000) }
    const signups = await getCourseSignups(db, courseID)
    if (signups && signups.length != 0) { systemLog(systemAction.ADMdeleteCourse, systemActionStatus.error, rm011002, validatedUser, db); return unprocessableContent(rm011002) }
    await deleteCourse(db, courseID)
    if (course.webinar){
        await deleteConference(course.webinar.id)
    }
    systemLog(systemAction.ADMdeleteCourse, systemActionStatus.success, `Usunięto szkolenie\n${dumpObject(course)}`, validatedUser, db)
    return Response.json(null, {status: 200})
}