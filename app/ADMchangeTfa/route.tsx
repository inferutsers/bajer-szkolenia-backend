import getDatabase from "@/connection/database"
import validateSession from "@/functions/validateSession"
import { badRequest, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import speakeasy from 'speakeasy'

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    password = headers.get("password"),
    tfaKey = headers.get("tfaKey")
    if (!sessionID || !password || !tfaKey) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID, password)
    if (!validatedUser) { return unauthorized }
    const isTFAMatching = speakeasy.totp.verify({
        secret: validatedUser.tfaSecret as string,
        token: tfaKey,
        step: Number(process.env.TFAPERIOD),
        digits: Number(process.env.TFADIGITS)
    })
    if (!isTFAMatching) { return unauthorized }
    const tfasecret = speakeasy.generateSecret().base32
    const tfaSetupLink = speakeasy.otpauthURL({
        secret: tfasecret,
        label: process.env.TFALABEL as string,
        type: 'totp',
        issuer: process.env.TFAISSUER as string,
        digits: Number(process.env.TFADIGITS),
        period: Number(process.env.TFAPERIOD)
    })
    const changes = await db.query('UPDATE "administration" SET "tfaSecret" = $1, "sessionID" = NULL, "sessionValidity" = NULL WHERE "id" = $2', [tfasecret, validatedUser.id])
    if (!changes || changes.rowCount == 0) { return unprocessableContent }
    return NextResponse.json(tfaSetupLink, {status: 200})
}