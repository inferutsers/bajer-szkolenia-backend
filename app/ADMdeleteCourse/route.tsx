import getDatabase from "@/connection/database";
import { getCourseSignupsCount } from "@/functions/getCourseSignups";
import { dumpObject, systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { deleteCourse, getCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm011000, rm011002 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = await getCourse(db, courseID)
    if (!course) { systemLog(systemAction.ADMdeleteCourse, systemActionStatus.error, rm011000, validatedUser, db); return notFound(rm011000) }
    const signups = await getCourseSignupsCount(db, courseID)
    if (signups != 0) { systemLog(systemAction.ADMdeleteCourse, systemActionStatus.error, rm011002, validatedUser, db); return unprocessableContent(rm011002) }
    await deleteCourse(db, courseID)
    systemLog(systemAction.ADMdeleteCourse, systemActionStatus.success, `Usunięto szkolenie\n${dumpObject(course)}`, validatedUser, db)
    return NextResponse.json(null, {status: 200})
}