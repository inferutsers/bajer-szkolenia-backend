import getDatabase from "@/connection/database";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { ADMcreateFileKey, ADMgetFile } from "@/functions/queries/publicFiles";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm101007, rm101008 } from "@/responses/messages";
import { badRequest, noContent, unauthorized, unprocessableContent } from "@/responses/responses";
import utf8 from 'utf8'

export async function POST(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    fileID = headers.get("fileID"),
    usageLimit = headers.get("usageLimit"),
    note = headers.get("note"),
    expiryDate = headers.get("expiryDate")
    if (!sessionID || !fileID || !note) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const file = await ADMgetFile(db, fileID)
    if (!file) { systemLog(systemAction.ADMcreateFileKey, systemActionStatus.error, rm101007, validatedUser, db); return unprocessableContent(rm101007) }
    const createdKey = await ADMcreateFileKey(db, fileID, utf8.decode(note), usageLimit, expiryDate)
    if (!createdKey){ systemLog(systemAction.ADMcreateFileKey, systemActionStatus.error, rm101008, validatedUser, db); return noContent(rm101008) }
    systemLog(systemAction.ADMcreateFileKey, systemActionStatus.success, `Stworzono klucz ${note} dla pliku #${fileID}\nLimit użyć: ${usageLimit}\nData wygaśnięcia: ${expiryDate}`, validatedUser, db);
    return Response.json(null, {status: 200})
}