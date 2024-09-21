import getDatabase from "@/connection/database";
import { getCourseSignups } from "@/functions/getCourseSignups";
import { ADMgetCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { badRequest, noContent, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signups = await getCourseSignups(db, courseID)
    if (!signups){ return noContent }
    const attendees = (signups.map(result => result.attendees)).flat()
    return NextResponse.json(attendees, {status: 200})
}