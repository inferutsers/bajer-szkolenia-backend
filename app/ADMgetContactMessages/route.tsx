import getDatabase from "@/connection/database"
import { getContactMessages } from "@/functions/queries/contact"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm071000 } from "@/responses/messages"
import { badRequest, noContent, unauthorized } from "@/responses/responses"

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const messages = await getContactMessages(db)
    if (!messages) { return noContent(rm071000) }
    return Response.json(messages, {status: 200})
}