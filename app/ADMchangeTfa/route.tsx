import getDatabase from "@/connection/database"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { updateTfaSecret } from "@/functions/queries/administration"
import { generateTfa, tfaMatcher } from "@/functions/TwoFactorAuth"
import validateSession from "@/functions/validateSession"
import { rm001001, rm001004, rm001005 } from "@/responses/messages"
import { badRequest, unauthorized } from "@/responses/responses"

export async function POST(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    password = headers.get("password"),
    tfaKey = headers.get("tfaKey")
    if (!sessionID || !password || !tfaKey) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID, password)
    if (!validatedUser) { return unauthorized(rm001004) }
    if (!tfaMatcher(validatedUser.tfaSecret as string, tfaKey)) { systemLog(systemAction.ADMchangeTfa, systemActionStatus.error, rm001005, validatedUser, db); return unauthorized(rm001005) }
    const {secret, setupLink} = generateTfa()
    await updateTfaSecret(db, secret, validatedUser.id)
    systemLog(systemAction.ADMchangeTfa, systemActionStatus.success, `Zmieniono token weryfikacji dwuetapowej`, validatedUser, db);
    return Response.json(setupLink, {status: 200})
}