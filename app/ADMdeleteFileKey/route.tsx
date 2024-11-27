import getDatabase from "@/connection/database";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { ADMdeleteFileKey } from "@/functions/queries/publicFiles";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001 } from "@/responses/messages";
import { badRequest, unauthorized } from "@/responses/responses";

export async function DELETE(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    fileKeyID = headers.get("fileKeyID")
    if (!sessionID || !fileKeyID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser || validatedUser.status < 5) { return unauthorized(rm001000) }
    await ADMdeleteFileKey(db, fileKeyID)
    systemLog(systemAction.ADMdeleteFileKey, systemActionStatus.success, `Usunięto klucz pliku - id klucza #${fileKeyID}`, validatedUser, db)
    return Response.json(null, {status: 200})
}