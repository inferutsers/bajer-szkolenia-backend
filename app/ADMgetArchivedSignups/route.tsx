import getDatabase from "@/connection/database"
import validateSession from "@/functions/validateSession"
import { badRequest, noContent, unauthorized } from "@/responses/responses"
import { rm001000, rm001001, rm021100 } from "@/responses/messages"
import { getSignups } from "@/functions/queries/signups"

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signups = await getSignups(db, true)
    if (!signups) { return noContent(rm021100) }
    return Response.json(signups, {status: 200})
}