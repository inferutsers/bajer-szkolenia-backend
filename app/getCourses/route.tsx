import getDatabase from "@/connection/database";
import { getCourses } from "@/functions/queries/course";
import { rm011100 } from "@/responses/messages";
import { noContent } from "@/responses/responses";

export async function GET(req: Request){
    const _ = req.headers,
    db = await getDatabase(req),
    courses = await getCourses(db)
    if (!courses) { return noContent(rm011100) }
    return Response.json(courses, {status: 200})
}
