import getDatabase from "@/connection/database";
import { getFileExtension } from "@/functions/getFileExtension";
import { compareObjects, systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { ADMeditFile, ADMgetFile } from "@/functions/queries/publicFiles";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm101002, rm101006, rm101010 } from "@/responses/messages";
import { badRequest, noContent, unauthorized, unprocessableContent } from "@/responses/responses";
import utf8 from 'utf8'

export async function PATCH(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    fileID = headers.get("fileID"),
    fileName = headers.get("fileName")
    if (!sessionID || !fileName || !fileID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const file = await ADMgetFile(db, fileID)
    if (!file){ systemLog(systemAction.ADMeditFile, systemActionStatus.error, rm101006, validatedUser, db); return noContent(rm101006) }
    if (getFileExtension(utf8.decode(fileName)) != getFileExtension(file.fileName)) { systemLog(systemAction.ADMeditFile, systemActionStatus.error, rm101002, validatedUser, db); return unprocessableContent(rm101002) }
    const modifiedFile = await ADMeditFile(db, fileID, utf8.decode(fileName))
    if (!modifiedFile){ systemLog(systemAction.ADMeditFile, systemActionStatus.error, rm101006, validatedUser, db); return noContent(rm101006) }
    systemLog(systemAction.ADMeditFile, systemActionStatus.success, `Zmieniono plik #${fileID}\n${compareObjects(file, modifiedFile)}`, validatedUser, db);
    return Response.json(modifiedFile, {status: 200})
}