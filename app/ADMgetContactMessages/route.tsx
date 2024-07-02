import getDatabase from "@/connection/database"
import { getContactMessages } from "@/functions/queries/contact"
import validateSession from "@/functions/validateSession"
import { badRequest, noContent, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const messages = await getContactMessages(db)
    if (!messages) { return noContent }
    return NextResponse.json(messages, {status: 200})
}