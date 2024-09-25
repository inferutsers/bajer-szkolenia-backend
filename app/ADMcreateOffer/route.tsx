import getDatabase from "@/connection/database"
import { dumpObject, systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { getCourse } from "@/functions/queries/course"
import { createOffer } from "@/functions/queries/offer"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm041001, rm041006 } from "@/responses/messages"
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
    if (!sessionID || !name || !coursesID || !price) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const coursesIDArray = JSON.parse(coursesID) as number[]
    coursesIDArray.forEach(async courseID => {
        const course = await getCourse(db, courseID)
        if (!course) { systemLog(systemAction.ADMcreateOffer, systemActionStatus.error, rm041001, validatedUser, db); return unprocessableContent(rm041001) }
    })
    const insertedOffer = await createOffer(
        db, 
        utf8.decode(name),
        (note ? utf8.decode(note) : undefined), 
        price, 
        coursesIDArray
    )
    if (!insertedOffer) { systemLog(systemAction.ADMcreateOffer, systemActionStatus.error, rm041006, validatedUser, db); return badRequest(rm041006) }
    systemLog(systemAction.ADMcreateOffer, systemActionStatus.success, `Stworzono pakiet\n${dumpObject(insertedOffer)}`, validatedUser, db);
    return NextResponse.json(insertedOffer, {status: 200})
}