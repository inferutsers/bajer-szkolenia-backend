import getDatabase from "@/connection/database"
import { createCourse, formatAsADMCourseElement } from "@/functions/queries/course"
import validateSession from "@/functions/validateSession"
import { badRequest, unauthorized } from "@/responses/responses"
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
    if (!sessionID || !date || !title || !place || !instructor || !price || !span || !slots) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
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
    if (!insertedCourse) { return badRequest }
    return NextResponse.json(insertedCourse, {status: 200})
}