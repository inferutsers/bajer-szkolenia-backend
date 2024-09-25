import getDatabase from "@/connection/database"
import administrationAccount from "@/interfaces/administrationAccount"
import { rm001001, rm001008 } from "@/responses/messages"
import { badRequest, notFound } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    resetToken = headers.get("resetToken")
    if (!resetToken) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const accountFoundArray = await db.query('SELECT * FROM "administration" WHERE "passwordResetToken" = $1 AND "status" > 0 LIMIT 1', [resetToken])
    if (!accountFoundArray || accountFoundArray.rowCount == 0) { return notFound(rm001008) }
    const accountFound: administrationAccount = accountFoundArray.rows.map((result) => ({id: result.id, login: result.login, displayName: result.displayName, password: result.password, status: result.status, sessionID: result.sessionID, sessionValidity: result.sessionValidity, passwordResetToken: result.passwordResetToken, tfaSecret: result.tfaSecret}))[0]
    return NextResponse.json({login: accountFound.login}, {status: 200})
}