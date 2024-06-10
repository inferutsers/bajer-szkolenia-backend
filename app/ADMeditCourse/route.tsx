import getDatabase from "@/connection/database"
import getCourseSignupCount from "@/functions/getCourseSignupCount"
import validateSession from "@/functions/validateSession"
import ADMcourseElement from "@/interfaces/ADMcourseElement"
import { badRequest, notFound, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"

export async function PATCH(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const courseID = headers.get("courseID")
    const date = headers.get("CDate")
    const title = headers.get("CTitle")
    const place = headers.get("CPlace")
    const instructor = headers.get("CInstructor")
    const note = headers.get("CNote")
    const price = headers.get("CPrice")
    const span = headers.get("CSpan")
    const slots = headers.get("CSlots")
    if (!sessionID || !courseID || !date || !title || !place || !instructor || !note || !price || !span || !slots) { return badRequest }
    const db = await getDatabase()
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const courseFoundArray = await db.query('SELECT * FROM "courses" WHERE "id" = $1 LIMIT 1', [courseID])
    if (!courseFoundArray || courseFoundArray.rowCount == 0) { return notFound }
    const changedCoursesArray = await db.query('UPDATE "courses" SET "date" = $1, "title" = $2, "place" = $3, "instructor" = $4, "note" = $5, "price" = $6, "span" = $7, "slots" = $8 WHERE "id" = $9 RETURNING *', [date, utf8.decode(title), utf8.decode(place), utf8.decode(instructor), utf8.decode(note), price, span, slots, courseID])
    if (!changedCoursesArray || changedCoursesArray.rowCount == 0) { return badRequest }
    var changedCourse: ADMcourseElement = (await Promise.all(changedCoursesArray.rows.map(async (result) => ({ id: result.id, date: result.date, span: result.span, price: result.price, title: result.title, place: result.place, instructor: result.instructor, note: result.note, slots: result.slots, slotsUsed: await getCourseSignupCount(db, result.id), available: result.available }) )))[0]
    return NextResponse.json(changedCourse, {status: 200})
}