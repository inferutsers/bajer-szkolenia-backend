import getDatabase from "@/connection/database"
import administrationAccount from "@/interfaces/administrationAccount"
import { badRequest, notFound } from "@/responses/responses"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from 'uuid';
import speakeasy from "speakeasy"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    resetToken = headers.get("resetToken"),
    newPassword = headers.get("newPassword")
    if (!resetToken || !newPassword) { return badRequest }
    const db = await getDatabase(req)
    const accountFoundArray = await db.query('SELECT * FROM "administration" WHERE "passwordResetToken" = $1 AND "status" > 0 LIMIT 1', [resetToken])
    if (!accountFoundArray || accountFoundArray.rowCount == 0) { return notFound }
    const accountFound: administrationAccount = accountFoundArray.rows.map((result) => ({id: result.id, login: result.login, displayName: result.displayName, password: result.password, status: result.status, sessionID: result.sessionID, sessionValidity: result.sessionValidity, passwordResetToken: result.passwordResetToken, tfaSecret: result.tfaSecret}))[0]
    const newPasswordHashed = await bcrypt.hash(newPassword, 7)
    const tfasecret = speakeasy.generateSecret().base32
    const tfaSetupLink = speakeasy.otpauthURL({
        secret: tfasecret,
        label: 'BAJEREXPERT Panel Administracyjny',
        type: 'totp',
        issuer: 'inferutsers Mateusz Zalewski',
        digits: 8,
        period: 20
    })
    await db.query('UPDATE "administration" SET "password" = $1, "passwordResetToken" = NULL, "sessionID" = NULL, "sessionValidity" = NULL, "tfaSecret" = $2 WHERE "id" = $3', [String(newPasswordHashed), tfasecret, accountFound.id])
    return NextResponse.json(tfaSetupLink, {status: 200})
}