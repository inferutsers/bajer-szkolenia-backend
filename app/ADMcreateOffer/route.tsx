import getDatabase from "@/connection/database"
import { getCourse } from "@/functions/queries/course"
import { createOffer } from "@/functions/queries/offer"
import validateSession from "@/functions/validateSession"
import { badRequest, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    name = headers.get("OName"),
    coursesID = headers.get("OCoursesID"),
    note = headers.get("ONote"),
    price = headers.get("OPrice")
    if (!sessionID || !name || !coursesID || !price) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const coursesIDArray = JSON.parse(coursesID) as number[]
    coursesIDArray.forEach(async courseID => {
        const course = await getCourse(db, courseID)
        if (!course) { return unprocessableContent }
    })
    const insertedOffer = await createOffer(
        db, 
        utf8.decode(name),
        (note ? utf8.decode(note) : undefined), 
        price, 
        coursesIDArray
    )
    if (!insertedOffer) { return badRequest }
    return NextResponse.json(insertedOffer, {status: 200})
}