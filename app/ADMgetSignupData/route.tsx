import getDatabase from "@/connection/database"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized } from "@/responses/responses"
import { getSignup } from "@/functions/queries/signups"
import { rm001000, rm001001, rm021000 } from "@/responses/messages"

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID"),
    archive = headers.get("archive")
    if (!sessionID || !signupID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID, (archive ?? "false") === "true")
    if (!signup) { return notFound(rm021000) }
    console.log(signup)
    return Response.json(signup, {status: 200})
}