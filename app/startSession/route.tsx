import getDatabase from "@/connection/database"
import administrationAccount from "@/interfaces/administrationAccount"
import { badRequest, serviceUnavailable, unauthorized } from "@/responses/responses"
import bcrypt from 'bcrypt'
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import speakeasy from "speakeasy"
import { getDateLong } from "@/functions/dates";

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    login = headers.get("SSLogin"),
    password = headers.get("SSPassword"),
    tfaKey = headers.get("SS2FAKey")
    if (!headers || !login || !password || !tfaKey) { return badRequest }
    const db = await getDatabase(req)
    const accountFoundArray = await db.query('SELECT * FROM "administration" WHERE "login" = $1 AND "status" > 0 AND "passwordResetToken" IS NULL LIMIT 1', [login])
    if (!accountFoundArray || accountFoundArray.rowCount == 0) { return unauthorized }
    const accountFound: administrationAccount = accountFoundArray.rows.map((result) => ({id: result.id, login: result.login, displayName: result.displayName, password: result.password, status: result.status, sessionID: result.sessionID, sessionValidity: result.sessionValidity, passwordResetToken: result.passwordResetToken, tfaSecret: result.tfaSecret}))[0]
    if (!accountFound) { return serviceUnavailable }
    const isPasswordMatching = await bcrypt.compare(password, String(accountFound.password))
    if (!isPasswordMatching) { return unauthorized }
    const isTFAMatching = speakeasy.totp.verify({
        secret: accountFound.tfaSecret as string,
        token: tfaKey,
        step: Number(process.env.TFAPERIOD),
        digits: Number(process.env.TFADIGITS)
    })
    if (!isTFAMatching) { return unauthorized }
    const newSessionID = uuidv4();
    const adjustedDate = getDateLong(new Date((new Date).getTime() + Number(process.env.PANELSESSIONVALIDITY)*60000))
    await db.query('UPDATE "administration" SET "sessionID" = $1, "sessionValidity" = $2 WHERE "id" = $3', [newSessionID, adjustedDate, accountFound.id])
    await db.query('INSERT INTO "log_sessions"("session", "administrator") VALUES ($1, $2)', [newSessionID, accountFound.id])
    return NextResponse.json(newSessionID, {status: 200})
}