import administrationAccount from "@/interfaces/administrationAccount";
import { Pool } from "pg";
import { getDateLong } from "./dates";
import bcrypt from 'bcrypt'

export default async function validateSession(db: Pool, sessionID: String, currentPassword?: string): Promise<administrationAccount | undefined>{
    const adjustedDate = getDateLong(new Date((new Date).getTime() + Number(process.env.PANELSESSIONVALIDITY)*60000))
    const accountFoundArray = await db.query('SELECT * FROM "administration" WHERE "sessionID" = $1 AND "status" > 0 AND "sessionValidity" > $2 AND "passwordResetToken" IS NULL LIMIT 1', [sessionID, getDateLong()])
    if (!accountFoundArray || accountFoundArray.rowCount == 0) { return undefined }
    if (currentPassword) {
        if (!(await bcrypt.compare(currentPassword, accountFoundArray.rows[0].password))) { return undefined }
    }
    const accountFound: administrationAccount = accountFoundArray.rows.map((result) => ({id: result.id, login: result.login, displayName: result.displayName, status: result.status, sessionID: result.sessionID, sessionValidity: result.sessionValidity, passwordResetToken: result.passwordResetToken, tfaSecret: result.tfaSecret}))[0]
    await db.query('UPDATE "administration" SET "sessionValidity" = $1 WHERE "id" = $2', [adjustedDate, accountFound.id])
    return accountFound
}