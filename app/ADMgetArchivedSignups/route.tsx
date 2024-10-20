import getDatabase from "@/connection/database"
import validateSession from "@/functions/validateSession"
import { badRequest, noContent, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"
import { getArchivedSignups } from "@/functions/queries/signups"
import { getCourseSignups } from "@/functions/getCourseSignups"
import { rm001000, rm001001, rm021100 } from "@/responses/messages"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const courseID = headers.get("courseID")
    const signups = !courseID ? await getArchivedSignups(db) : await getCourseSignups(db, courseID)
    if (!signups) { return noContent(rm021100) }
    return NextResponse.json(signups, {status: 200})
}