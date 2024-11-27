import getDatabase from "@/connection/database";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { ADMdeleteFile } from "@/functions/queries/publicFiles";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001 } from "@/responses/messages";
import { badRequest, unauthorized } from "@/responses/responses";

export async function DELETE(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    fileID = headers.get("fileID")
    if (!sessionID || !fileID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser || validatedUser.status < 5) { return unauthorized(rm001000) }
    await ADMdeleteFile(db, fileID)
    systemLog(systemAction.ADMdeleteFile, systemActionStatus.success, `Usunięto plik #${fileID}`, validatedUser, db)
    return Response.json(null, {status: 200})
}