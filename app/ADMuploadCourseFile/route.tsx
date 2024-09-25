import getDatabase from "@/connection/database";
import getBufferFromString from "@/functions/getBufferFromString";
import processBody from "@/functions/processBody";
import { ADMgetCourse, uploadFile } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm011000, rm011008, rm011009, rm011010 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";
import utf8 from 'utf8'

export async function POST(req: NextRequest, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID"),
    fileName = headers.get("fileName"),
    file = await processBody(req)
    if (!sessionID || !courseID || !fileName || !file) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = await ADMgetCourse(db, courseID)
    if (!course) { return notFound(rm011000) }
    if (course.fileName != undefined) { return notFound(rm011008) }
    const buffer = await getBufferFromString(file)
    if (!buffer) { return unprocessableContent(rm011009) }
    const courseUpdated = await uploadFile(db, course.id, buffer, utf8.decode(fileName))
    if (courseUpdated == false) { return unprocessableContent(rm011010) }
    return NextResponse.json(null, {status: 200})
}