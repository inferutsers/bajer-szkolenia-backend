import getDatabase from "@/connection/database"
import { formatAsADMCourseElement } from "@/functions/queries/course"
import validateSession from "@/functions/validateSession"
import ADMcourseElement from "@/interfaces/ADMcourseElement"
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
    slots = headers.get("CSlots")
    if (!sessionID || !date || !title || !place || !instructor || !note || !price || !span || !slots) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const insteredCourseArray = await db.query('INSERT INTO "courses"("date", "title", "place", "instructor", "note", "price", "span", "slots", "available") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *', [date, utf8.decode(title), utf8.decode(place), utf8.decode(instructor), utf8.decode(note), price, span, slots])
    if (!insteredCourseArray || insteredCourseArray.rowCount == 0) { return badRequest }
    var insertedCourse: ADMcourseElement = await formatAsADMCourseElement(insteredCourseArray.rows[0], db)
    return NextResponse.json(insertedCourse, {status: 200})
}