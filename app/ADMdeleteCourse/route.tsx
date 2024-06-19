import getDatabase from "@/connection/database";
import { getCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { badRequest, notFound, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const course = await getCourse(db, courseID)
    if (!course) { return notFound }
    await db.query('DELETE FROM "courses" WHERE "id" = $1', [courseID])
    return NextResponse.json(null, {status: 200})
}