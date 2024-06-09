import getDatabase from "@/connection/database"
import administrationAccount from "@/interfaces/administrationAccount"
import { badRequest, notFound } from "@/responses/responses"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest }
    const db = await getDatabase()
    const currentDate = new Date()
    const adjustedDate = new Date(currentDate.getTime() + 30*60000);
    const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}+${currentDate.getTimezoneOffset()}`
    const adjustedDateFormatted = `${adjustedDate.getFullYear()}-${adjustedDate.getMonth() + 1}-${adjustedDate.getDate()} ${adjustedDate.getHours()}:${adjustedDate.getMinutes()}:${adjustedDate.getSeconds()}+${adjustedDate.getTimezoneOffset()}`
    const accountFoundArray = await db.query('SELECT * FROM "administration" WHERE "sessionID" = $1 AND "status" > 0 AND "sessionValidity" > $2 AND "passwordResetToken" IS NULL LIMIT 1', [sessionID, currentDateFormatted])
    if (!accountFoundArray || accountFoundArray.rowCount == 0) { return notFound }
    const accountFound: administrationAccount = accountFoundArray.rows.map((result) => ({id: result.id, login: result.login, displayName: result.displayName, status: result.status, sessionID: result.sessionID, sessionValidity: result.sessionValidity, passwordResetToken: result.passwordResetToken}))[0]
    await db.query('UPDATE "administration" SET "sessionValidity" = $1 WHERE "id" = $2', [adjustedDateFormatted, accountFound.id])
    return NextResponse.json(null, {status: 200})
}