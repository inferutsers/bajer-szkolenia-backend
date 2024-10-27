import getDatabase from "@/connection/database";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { ADMgetCourse, deleteFile } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm011000, rm011003, rm011004, rm011012 } from "@/responses/messages";
import { badRequest, notFound, serviceUnavailable, unauthorized, unprocessableContent } from "@/responses/responses";

export async function DELETE(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = await ADMgetCourse(db, courseID)
    if (!course) { systemLog(systemAction.ADMdeleteCourseFile, systemActionStatus.error, rm011000, validatedUser, db); return notFound(rm011000) }
    if (!course.fileName) { systemLog(systemAction.ADMdeleteCourseFile, systemActionStatus.error, rm011003, validatedUser, db); return notFound(rm011003) }
    if (!course.available) { systemLog(systemAction.ADMeditCourse, systemActionStatus.error, rm011012, validatedUser, db); return serviceUnavailable(rm011012) }
    if (course.permissionRequired > validatedUser.status) { systemLog(systemAction.ADMdeleteCourseFile, systemActionStatus.error, rm001000, validatedUser, db); return unauthorized(rm001000) }
    const courseUpdated = await deleteFile(db, course.id)
    if (courseUpdated == false) { systemLog(systemAction.ADMdeleteCourseFile, systemActionStatus.error, rm011004, validatedUser, db); return unprocessableContent(rm011004) }
    systemLog(systemAction.ADMdeleteCourseFile, systemActionStatus.success, `Usunięto plik ze szkolenia #${course.id}`, validatedUser, db);
    return Response.json(null, {status: 200})
}