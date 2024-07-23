import getDatabase from "@/connection/database";
import { ADMgetCourse, deleteFile } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const course = await ADMgetCourse(db, courseID)
    if (!course || !course.fileName) { return notFound }
    const courseUpdated = await deleteFile(db, course.id)
    if (courseUpdated == false) { return unprocessableContent }
    return NextResponse.json(null, {status: 200})
}