import getDatabase from "@/connection/database";
import getCourseSignupCount from "@/functions/getCourseSignupCount";
import { deleteCourse, getCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const course = await getCourse(db, courseID)
    if (!course) { return notFound }
    const signups = await getCourseSignupCount(db, courseID)
    if (signups != 0) { return unprocessableContent }
    await deleteCourse(db, courseID)
    return NextResponse.json(null, {status: 200})
}