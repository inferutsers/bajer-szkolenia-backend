import getDatabase from "@/connection/database"
import { getCourse } from "@/functions/queries/course"
import { rm001001, rm011000 } from "@/responses/messages"
import { badRequest, notFound } from "@/responses/responses"

export async function GET(req: Request){
    const headers = req.headers,
    courseID = headers.get("courseID")
    if (!courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const course = await getCourse(db, courseID)
    if (!course || course.customURL != undefined) { return notFound(rm011000) }
    return Response.json(course, {status: 200})
}