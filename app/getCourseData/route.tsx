import getDatabase from "@/connection/database"
import { getCourse } from "@/functions/queries/course"
import { badRequest, notFound } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    courseID = headers.get("courseID")
    if (!courseID) { return badRequest }
    const db = await getDatabase(req)
    const course = await getCourse(db, courseID)
    if (!course || course.customURL != undefined) { return notFound }
    return NextResponse.json(course, {status: 200})
}