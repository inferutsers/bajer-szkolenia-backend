import getDatabase from "@/connection/database"
import { getNewsletterMessages } from "@/functions/queries/newsletter"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm081100 } from "@/responses/messages"
import { badRequest, noContent, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const messages = await getNewsletterMessages(db)
    if (!messages) { return noContent(rm081100) }
    return NextResponse.json(messages, {status: 200})
}