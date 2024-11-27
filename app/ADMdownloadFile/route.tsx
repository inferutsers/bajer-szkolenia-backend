import getDatabase from "@/connection/database";
import { ADMdownloadFile } from "@/functions/queries/publicFiles";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm101005 } from "@/responses/messages";
import { badRequest, notFound, unauthorized } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    fileID = headers.get("fileID")
    if (!sessionID || !fileID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser){ return unauthorized(rm001000) }
    var file = await ADMdownloadFile(db, fileID)
    if (!file) { return notFound(rm101005) }
    return Response.json(file, {status: 200})
}