import getDatabase from "@/connection/database"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import validateSession from "@/functions/validateSession"
import { rm001001, rm001004, rm001005, rm001007 } from "@/responses/messages"
import { badRequest, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import speakeasy from 'speakeasy'

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    password = headers.get("password"),
    tfaKey = headers.get("tfaKey")
    if (!sessionID || !password || !tfaKey) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID, password)
    if (!validatedUser) { return unauthorized(rm001004) }
    const isTFAMatching = speakeasy.totp.verify({
        secret: validatedUser.tfaSecret as string,
        token: tfaKey,
        step: Number(process.env.TFAPERIOD),
        digits: Number(process.env.TFADIGITS)
    })
    if (!isTFAMatching) { systemLog(systemAction.ADMchangeTfa, systemActionStatus.error, rm001005, validatedUser, db); return unauthorized(rm001005) }
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
    if (!changes || changes.rowCount == 0) { systemLog(systemAction.ADMchangeTfa, systemActionStatus.error, rm001007, validatedUser, db); return unprocessableContent(rm001007) }
    systemLog(systemAction.ADMchangeTfa, systemActionStatus.success, `Zmieniono token weryfikacji dwuetapowej`, validatedUser, db);
    return NextResponse.json(tfaSetupLink, {status: 200})
}