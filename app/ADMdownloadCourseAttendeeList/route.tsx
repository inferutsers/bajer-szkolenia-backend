import getDatabase from "@/connection/database";
import { getCourseSignups } from "@/functions/getCourseSignups";
import { ADMgetCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { badRequest, noContent, notFound, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";
import generateAttendeeListPDF from "@/functions/generateAttendeeListPDF";
import { rm001000, rm001001, rm011000, rm011001 } from "@/responses/messages";

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = await ADMgetCourse(db, courseID)
    if (!course){return notFound(rm011000) }
    const signups = await getCourseSignups(db, courseID)
    if (!signups){ return noContent(rm011001) }
    const pdf = await generateAttendeeListPDF(course, signups, validatedUser)
    return NextResponse.json(pdf, {status: 200})
}