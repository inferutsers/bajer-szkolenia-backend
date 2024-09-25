import getDatabase from "@/connection/database";
import { getCourseSignupsCount } from "@/functions/getCourseSignups";
import { deleteCourse, getCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm011000, rm011002 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = await getCourse(db, courseID)
    if (!course) { return notFound(rm011000) }
    const signups = await getCourseSignupsCount(db, courseID)
    if (signups != 0) { return unprocessableContent(rm011002) }
    await deleteCourse(db, courseID)
    return NextResponse.json(null, {status: 200})
}