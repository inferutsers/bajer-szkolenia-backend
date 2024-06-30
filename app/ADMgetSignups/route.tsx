import getDatabase from "@/connection/database"
import validateSession from "@/functions/validateSession"
import { badRequest, noContent, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"
import { getCourseSignups, getSignups } from "@/functions/queries/signups"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const courseID = headers.get("courseID")
    const signups = !courseID ? await getSignups(db) : await getCourseSignups(db, courseID)
    if (!signups) { return noContent }
    return NextResponse.json(signups, {status: 200})
}