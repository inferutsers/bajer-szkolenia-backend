import getDatabase from "@/connection/database"
import { dumpObject, systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { createCourse } from "@/functions/queries/course"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm011006 } from "@/responses/messages"
import { badRequest, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    date = headers.get("CDate"),
    title = headers.get("CTitle"),
    place = headers.get("CPlace"),
    instructor = headers.get("CInstructor"),
    note = headers.get("CNote"),
    price = headers.get("CPrice"),
    span = headers.get("CSpan"),
    slots = headers.get("CSlots"),
    customURL = headers.get("CCustomURL")
    if (!sessionID || !date || !title || !place || !instructor || !price || !span || !slots) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const insertedCourse = await createCourse(
        db, 
        date,
        utf8.decode(title), 
        utf8.decode(place), 
        utf8.decode(instructor), 
        (note ? utf8.decode(note) : undefined), 
        price, 
        span, 
        slots,
        (customURL ? utf8.decode(customURL) : undefined)
    )
    if (!insertedCourse) { systemLog(systemAction.ADMcreateCourse, systemActionStatus.error, rm011006, validatedUser, db); return unprocessableContent(rm011006) }
    systemLog(systemAction.ADMcreateCourse, systemActionStatus.success, `Stworzono szkolenie\n${dumpObject(insertedCourse)}`, validatedUser, db);
    return NextResponse.json(insertedCourse, {status: 200})
}