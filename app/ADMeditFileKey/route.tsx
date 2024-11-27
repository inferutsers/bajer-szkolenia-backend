import getDatabase from "@/connection/database";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { ADMeditFileKey } from "@/functions/queries/publicFiles";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm101009 } from "@/responses/messages";
import { badRequest, noContent, unauthorized } from "@/responses/responses";
import utf8 from 'utf8'

export async function PATCH(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    fileKeyID = headers.get("fileKeyID"),
    note = headers.get("note"),
    usageLimit = headers.get("usageLimit"),
    expiryDate = headers.get("expiryDate")
    if (!sessionID || !fileKeyID || !note) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const modifiedFileKey = await ADMeditFileKey(db, fileKeyID, utf8.decode(note), usageLimit, expiryDate)
    if (!modifiedFileKey){ systemLog(systemAction.ADMeditFileKey, systemActionStatus.error, rm101009, validatedUser, db); return noContent(rm101009) }
    systemLog(systemAction.ADMeditFileKey, systemActionStatus.success, `Zmieniono klucz ${note} pliku - id klucza #${fileKeyID}\nLimit użyć: ${usageLimit}\nData wygaśnięcia: ${expiryDate}`, validatedUser, db)
    return Response.json(null, {status: 200})
}