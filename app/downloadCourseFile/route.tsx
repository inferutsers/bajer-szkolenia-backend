import getDatabase from "@/connection/database";
import { getCourse, getCourseFile } from "@/functions/queries/course";
import { badRequest, notFound } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: Response){
    const headers = req.headers,
    courseID = headers.get("courseID")
    if (!courseID) { return badRequest }
    const db = await getDatabase(req)
    const course = await getCourse(db, courseID)
    if (!course || !course.fileName) { return notFound }
    const courseFile = await getCourseFile(db, course.id)
    if (!courseFile) { return notFound }
    return NextResponse.json({name: course.fileName, file: courseFile}, {status: 200})
}