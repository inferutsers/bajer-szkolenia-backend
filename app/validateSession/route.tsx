import getDatabase from "@/connection/database"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001 } from "@/responses/messages"
import { badRequest, notFound } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const sessionValidated = await validateSession(db, sessionID)
    if (!sessionValidated) { return notFound(rm001000) }
    return NextResponse.json(sessionValidated, {status: 200})
}