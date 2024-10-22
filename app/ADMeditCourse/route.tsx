import getDatabase from "@/connection/database"
import { compareObjects, systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { getCourse, updateCourse } from "@/functions/queries/course"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm011000, rm011005, rm011012 } from "@/responses/messages"
import { badRequest, notFound, serviceUnavailable, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"

export async function PATCH(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID"),
    date = headers.get("CDate"),
    title = headers.get("CTitle"),
    place = headers.get("CPlace"),
    instructor = headers.get("CInstructor"),
    note = headers.get("CNote"),
    price = headers.get("CPrice"),
    span = headers.get("CSpan"),
    slots = headers.get("CSlots"),
    customURL = headers.get("CCustomURL")
    if (!sessionID || !courseID || !date || !title || !place || !instructor || !price || !span || !slots) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = await getCourse(db, courseID)
    if (!course) { systemLog(systemAction.ADMeditCourse, systemActionStatus.error, rm011000, validatedUser, db); return notFound(rm011000) }
    if (!course.available) { systemLog(systemAction.ADMeditCourse, systemActionStatus.error, rm011012, validatedUser, db); return serviceUnavailable(rm011012) }
    if (course.permissionRequired > validatedUser.status) { systemLog(systemAction.ADMeditCourse, systemActionStatus.error, rm001000, validatedUser, db); return unauthorized(rm001000) }
    const changedCourse = await updateCourse(db, courseID, date, utf8.decode(title), utf8.decode(place), utf8.decode(instructor), note ? utf8.decode(note) : undefined, price, span, (customURL ? utf8.decode(customURL) : undefined), slots)
    if (!changedCourse) { systemLog(systemAction.ADMeditCourse, systemActionStatus.error, rm011005, validatedUser, db); return unprocessableContent(rm011005) }
    systemLog(systemAction.ADMeditCourse, systemActionStatus.success, `Zmieniono szkolenie #${course.id}\n${compareObjects(course, changedCourse)}`, validatedUser, db);
    return NextResponse.json(changedCourse, {status: 200})
}