import getDatabase from "@/connection/database";
import { ADMgetCourse, deleteFile } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm011000, rm011003, rm011004 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = await ADMgetCourse(db, courseID)
    if (!course) { return notFound(rm011000) }
    if (!course.fileName) { return notFound(rm011003) }
    const courseUpdated = await deleteFile(db, course.id)
    if (courseUpdated == false) { return unprocessableContent(rm011004) }
    return NextResponse.json(null, {status: 200})
}