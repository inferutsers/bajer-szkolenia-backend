import getDatabase from "@/connection/database"
import { getSignup, invalidateSignup } from "@/functions/queries/signups"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound }
    const signupInvalidated = await invalidateSignup(db, signupID)
    if (!signupInvalidated) { return unprocessableContent }
    return NextResponse.json(null, {status: 200})
}