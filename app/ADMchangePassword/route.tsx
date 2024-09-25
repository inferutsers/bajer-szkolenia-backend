import getDatabase from "@/connection/database"
import validateAndHashPassword from "@/functions/passwordValidator"
import validateSession from "@/functions/validateSession"
import { rm001001, rm001004, rm001005, rm001006, rm001007 } from "@/responses/messages"
import { badRequest, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import speakeasy from 'speakeasy'

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    oldPassword = headers.get("oldPassword"),
    newPassword = headers.get("newPassword"),
    tfaKey = headers.get("tfaKey")
    if (!sessionID || !newPassword || !tfaKey || !oldPassword) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID, oldPassword)
    if (!validatedUser) { return unauthorized(rm001004) }
    const isTFAMatching = speakeasy.totp.verify({
        secret: validatedUser.tfaSecret as string,
        token: tfaKey,
        step: Number(process.env.TFAPERIOD),
        digits: Number(process.env.TFADIGITS)
    })
    if (!isTFAMatching) { return unauthorized(rm001005) }
    const hashedPassword = await validateAndHashPassword(newPassword)
    if (!hashedPassword) { return unprocessableContent(rm001006) }
    const changes = await db.query('UPDATE "administration" SET "password" = $1, "sessionID" = NULL, "sessionValidity" = NULL WHERE "id" = $2', [hashedPassword, validatedUser.id])
    if (!changes || changes.rowCount == 0) { return unprocessableContent(rm001007) }
    return NextResponse.json(null, {status: 200})
}