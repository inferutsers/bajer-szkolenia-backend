import getDatabase from "@/connection/database"
import { getCourse, updateCourse } from "@/functions/queries/course"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized } from "@/responses/responses"
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
    slots = headers.get("CSlots")
    if (!sessionID || !courseID || !date || !title || !place || !instructor || !price || !span || !slots) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const course = await getCourse(db, courseID)
    if (!course) { return notFound }
    const changedCourse = await updateCourse(db, courseID, date, utf8.decode(title), utf8.decode(place), utf8.decode(instructor), note ? utf8.decode(note) : undefined, price, span, slots)
    if (!changedCourse) { return badRequest }
    return NextResponse.json(changedCourse, {status: 200})
}