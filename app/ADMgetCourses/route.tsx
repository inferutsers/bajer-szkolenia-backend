import getDatabase from "@/connection/database";
import getCourseSignupCount from "@/functions/getCourseSignupCount";
import validateSession from "@/functions/validateSession";
import ADMcourseElement from "@/interfaces/ADMcourseElement";
import { badRequest, noContent, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest }
    const db = await getDatabase()
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const currentDate = new Date()
    const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}+${currentDate.getTimezoneOffset()}`
    const results = await db.query('SELECT * FROM courses WHERE date > $1 ORDER BY date', [currentDateFormatted])
    if (results.rowCount == 0){ return noContent }
    var elements: ADMcourseElement[] = await Promise.all(results.rows.map(async (result) => ({ id: result.id, date: result.date, span: result.span, price: result.price, title: result.title, place: result.place, instructor: result.instructor, note: result.note, slots: result.slots, slotsUsed: await getCourseSignupCount(db, result.id), available: result.available }) ))
    return NextResponse.json(elements, {status: 200})
}