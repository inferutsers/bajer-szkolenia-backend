import getDatabase from "@/connection/database";
import { getCourse, getCourseFile } from "@/functions/queries/course";
import { rm001001, rm011000, rm011003, rm011011 } from "@/responses/messages";
import { badRequest, notFound } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: Response){
    const headers = req.headers,
    courseID = headers.get("courseID")
    if (!courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const course = await getCourse(db, courseID)
    if (!course) { return notFound(rm011000) }
    if (!course.fileName) { return notFound(rm011003) }
    const courseFile = await getCourseFile(db, course.id)
    if (!courseFile) { return notFound(rm011011) }
    return NextResponse.json({name: course.fileName, file: courseFile}, {status: 200})
}