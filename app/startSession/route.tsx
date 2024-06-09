import getDatabase from "@/connection/database"
import administrationAccount from "@/interfaces/administrationAccount"
import { badRequest, serviceUnavailable, unauthorized } from "@/responses/responses"
import bcrypt from 'bcrypt'
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request, res: Response){
    const headers = req.headers
    const login = headers.get("SSLogin")
    const password = headers.get("SSPassword")
    if (!headers || !login || !password) { return badRequest }
    const db = await getDatabase()
    const accountFoundArray = await db.query('SELECT * FROM "administration" WHERE "login" = $1 AND "status" > 0 AND "passwordResetToken" IS NULL LIMIT 1', [login])
    if (!accountFoundArray || accountFoundArray.rowCount == 0) { return unauthorized }
    const accountFound: administrationAccount = accountFoundArray.rows.map((result) => ({id: result.id, login: result.login, displayName: result.displayName, password: result.password, status: result.status, sessionID: result.sessionID, sessionValidity: result.sessionValidity, passwordResetToken: result.passwordResetToken}))[0]
    if (!accountFound) { return serviceUnavailable }
    const isPasswordMatching = await bcrypt.compare(password, String(accountFound.password))
    if (!isPasswordMatching) { return unauthorized }
    const newSessionID = uuidv4();
    const currentDate = new Date()
    const adjustedDate = new Date(currentDate.getTime() + 30*60000);
    const adjustedDateFormatted = `${adjustedDate.getFullYear()}-${adjustedDate.getMonth() + 1}-${adjustedDate.getDate()} ${adjustedDate.getHours()}:${adjustedDate.getMinutes()}:${adjustedDate.getSeconds()}+${adjustedDate.getTimezoneOffset()}`
    await db.query('UPDATE "administration" SET "sessionID" = $1, "sessionValidity" = $2 WHERE "id" = $3', [newSessionID, adjustedDateFormatted, accountFound.id])
    return NextResponse.json(newSessionID, {status: 200})
}   