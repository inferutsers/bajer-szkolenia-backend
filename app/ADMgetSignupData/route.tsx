import getDatabase from "@/connection/database"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"
import { getSignup } from "@/functions/queries/signups"
import { rm001000, rm001001, rm021000 } from "@/responses/messages"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound(rm021000) }
    return NextResponse.json(signup, {status: 200})
}