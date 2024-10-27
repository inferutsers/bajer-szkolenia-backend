import getDatabase from "@/connection/database"
import { badRequest, notFound, unprocessableContent } from "@/responses/responses"
import { rm001001, rm001006, rm001008 } from "@/responses/messages"
import { systemLog } from "@/functions/logging/log"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"
import { getAdministratorByPRT, updatePassword, updateTfaSecret } from "@/functions/queries/administration"
import { generateTfa } from "@/functions/TwoFactorAuth"
import validateAndHashPassword from "@/functions/passwordValidator"

export async function POST(req: Request){
    const headers = req.headers,
    resetToken = headers.get("resetToken"),
    newPassword = headers.get("newPassword")
    if (!resetToken || !newPassword) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const accountFound = await getAdministratorByPRT(db, resetToken)
    if (!accountFound) { return notFound(rm001008) }
    const hashedPassword = await validateAndHashPassword(newPassword)
    if (!hashedPassword) { systemLog(systemAction.changePasswordWithToken, systemActionStatus.error, rm001006, accountFound, db); return unprocessableContent(rm001006) }
    const {secret, setupLink} = generateTfa()
    await updatePassword(db, hashedPassword, accountFound.id)
    await updateTfaSecret(db, secret, accountFound.id)
    systemLog(systemAction.changePasswordWithToken, systemActionStatus.success, `Użyto tokenu zmiany hasła`, accountFound, db)
    return Response.json(setupLink, {status: 200})
}