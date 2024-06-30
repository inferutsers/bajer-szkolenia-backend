import getDatabase from "@/connection/database";
import { ADMgetCourses } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { badRequest, noContent, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const courses = await ADMgetCourses(db)
    if (!courses){ return noContent }
    return NextResponse.json(courses, {status: 200})
}