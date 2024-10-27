import getDatabase from "@/connection/database";
import { ADMgetArchivedCourses } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm011100 } from "@/responses/messages";
import { badRequest, noContent, unauthorized } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const courses = await ADMgetArchivedCourses(db)
    if (!courses){ return noContent(rm011100) }
    return Response.json(courses, {status: 200})
}