import getDatabase from "@/connection/database";
import { ADMgetArchivedCourse, ADMgetCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm011000 } from "@/responses/messages";
import { badRequest, notFound, unauthorized } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID"),
    archive = headers.get("archive")
    if (!sessionID || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = archive === "true" ? (await ADMgetArchivedCourse(db, courseID)) : (await ADMgetCourse(db, courseID))
    if (!course){ return notFound(rm011000) }
    return Response.json(course, {status: 200})
}