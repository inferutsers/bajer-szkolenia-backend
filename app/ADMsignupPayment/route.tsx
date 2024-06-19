import getDatabase from "@/connection/database"
import { getSignup } from "@/functions/queries/signups"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const signupID = headers.get("signupID")
    const paymentAmount = headers.get("paymentAmount")
    if (!sessionID || !signupID || !paymentAmount) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound }
    const editedSignup = await db.query('UPDATE "signups" SET "paidIn" = "paidIn" + $1 WHERE "id" = $2 AND "invalidated" = false', [paymentAmount, signupID])
    if (!editedSignup || editedSignup.rowCount == 0) { return unprocessableContent }
    return NextResponse.json(null, {status: 200})
}