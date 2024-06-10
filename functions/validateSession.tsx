import administrationAccount from "@/interfaces/administrationAccount";
import { Pool } from "pg";

export default async function validateSession(db: Pool, sessionID: String): Promise<administrationAccount | undefined>{
    const currentDate = new Date()
    const adjustedDate = new Date(currentDate.getTime() + 30*60000);
    const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}+${currentDate.getTimezoneOffset()}`
    const adjustedDateFormatted = `${adjustedDate.getFullYear()}-${adjustedDate.getMonth() + 1}-${adjustedDate.getDate()} ${adjustedDate.getHours()}:${adjustedDate.getMinutes()}:${adjustedDate.getSeconds()}+${adjustedDate.getTimezoneOffset()}`
    const accountFoundArray = await db.query('SELECT * FROM "administration" WHERE "sessionID" = $1 AND "status" > 0 AND "sessionValidity" > $2 AND "passwordResetToken" IS NULL LIMIT 1', [sessionID, currentDateFormatted])
    if (!accountFoundArray || accountFoundArray.rowCount == 0) { return undefined }
    const accountFound: administrationAccount = accountFoundArray.rows.map((result) => ({id: result.id, login: result.login, displayName: result.displayName, status: result.status, sessionID: result.sessionID, sessionValidity: result.sessionValidity, passwordResetToken: result.passwordResetToken}))[0]
    await db.query('UPDATE "administration" SET "sessionValidity" = $1 WHERE "id" = $2', [adjustedDateFormatted, accountFound.id])
    return accountFound
}