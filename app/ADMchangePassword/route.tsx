import getDatabase from "@/connection/database"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import validateAndHashPassword from "@/functions/passwordValidator"
import { updatePassword } from "@/functions/queries/administration"
import { tfaMatcher } from "@/functions/TwoFactorAuth"
import validateSession from "@/functions/validateSession"
import { rm001001, rm001004, rm001005, rm001006 } from "@/responses/messages"
import { badRequest, unauthorized, unprocessableContent } from "@/responses/responses"

export async function POST(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    oldPassword = headers.get("oldPassword"),
    newPassword = headers.get("newPassword"),
    tfaKey = headers.get("tfaKey")
    if (!sessionID || !newPassword || !tfaKey || !oldPassword) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID, oldPassword)
    if (!validatedUser) { return unauthorized(rm001004) }
    if (!tfaMatcher(validatedUser.tfaSecret as string, tfaKey)) { systemLog(systemAction.ADMchangePassowrd, systemActionStatus.error, rm001005, validatedUser, db); return unauthorized(rm001005) }
    const hashedPassword = await validateAndHashPassword(newPassword)
    if (!hashedPassword) { systemLog(systemAction.ADMchangePassowrd, systemActionStatus.error, rm001006, validatedUser, db); return unprocessableContent(rm001006) }
    await updatePassword(db, hashedPassword, validatedUser.id)
    systemLog(systemAction.ADMchangePassowrd, systemActionStatus.success, `Zmieniono hasło`, validatedUser, db);
    return Response.json(null, {status: 200})
}