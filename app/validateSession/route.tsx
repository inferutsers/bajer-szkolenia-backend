import getDatabase from "@/connection/database"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest }
    const db = await getDatabase(req)
    const sessionValidated = await validateSession(db, sessionID)
    if (!sessionValidated) { return notFound }
    return NextResponse.json(sessionValidated, {status: 200})
}