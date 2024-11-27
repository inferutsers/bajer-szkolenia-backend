import getDatabase from "@/connection/database";
import getBufferFromString from "@/functions/getBufferFromString";
import { getFileExtension } from "@/functions/getFileExtension";
import { dumpObject, systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import processBody from "@/functions/processBody";
import { ADMcreateFile } from "@/functions/queries/publicFiles";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm101002, rm101006 } from "@/responses/messages";
import { badRequest, noContent, unauthorized, unprocessableContent } from "@/responses/responses";
import utf8 from 'utf8'

export async function POST(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    fileName = headers.get("fileName"),
    file = await processBody(req)
    if (!sessionID || !fileName || !file) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    if (!getFileExtension(utf8.decode(fileName))) { systemLog(systemAction.ADMcreateFile, systemActionStatus.error, rm101002, validatedUser, db); return unprocessableContent(rm101002) }
    const buffer = await getBufferFromString(file)
    if (!buffer) { systemLog(systemAction.ADMcreateFile, systemActionStatus.error, rm101006, validatedUser, db); return unprocessableContent(rm101006) }
    const createdFile = await ADMcreateFile(db, buffer, utf8.decode(fileName))
    if (!createdFile){ systemLog(systemAction.ADMcreateFile, systemActionStatus.error, rm101006, validatedUser, db); return noContent(rm101006) }
    systemLog(systemAction.ADMcreateFile, systemActionStatus.success, `Stworzono plik\n${dumpObject(createdFile)}`, validatedUser, db);
    return Response.json(createdFile, {status: 200})
}