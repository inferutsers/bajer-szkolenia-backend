import getDatabase from "@/connection/database"
import validateSession from "@/functions/validateSession"
import ADMcourseElement from "@/interfaces/ADMcourseElement"
import { badRequest, notFound, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"

export async function POST(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const date = headers.get("CDate")
    const title = headers.get("CTitle")
    const place = headers.get("CPlace")
    const instructor = headers.get("CInstructor")
    const note = headers.get("CNote")
    const price = headers.get("CPrice")
    const span = headers.get("CSpan")
    const slots = headers.get("CSlots")
    if (!sessionID || !date || !title || !place || !instructor || !note || !price || !span || !slots) { return badRequest }
    const db = await getDatabase()
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const insteredCourseArray = await db.query('INSERT INTO "courses"("date", "title", "place", "instructor", "note", "price", "span", "slots", "available") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *', [date, utf8.decode(title), utf8.decode(place), utf8.decode(instructor), utf8.decode(note), price, span, slots])
    if (!insteredCourseArray || insteredCourseArray.rowCount == 0) { return badRequest }
    var insertedCourse: ADMcourseElement = (await Promise.all(insteredCourseArray.rows.map(async (result) => ({ id: result.id, date: result.date, span: result.span, price: result.price, title: result.title, place: result.place, instructor: result.instructor, note: result.note, slots: result.slots, slotsUsed: 0, available: result.available }) )))[0]
    return NextResponse.json(insertedCourse, {status: 200})
}