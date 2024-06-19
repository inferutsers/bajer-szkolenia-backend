import getDatabase from "@/connection/database"
import { getSignup } from "@/functions/queries/signups"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound }
    const signupsChanged = await db.query('UPDATE "signups" SET "invalidated" = true WHERE "id" = $1', [signupID])
    if (!signupsChanged || signupsChanged.rowCount != 1) { return unprocessableContent }
    return NextResponse.json(null, {status: 200})
}