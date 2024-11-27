import getDatabase from "@/connection/database";
import { ADMgetFile } from "@/functions/queries/publicFiles";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm101005 } from "@/responses/messages";
import { badRequest, noContent, unauthorized } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    fileID = headers.get("fileID")
    if (!sessionID || !fileID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const file = await ADMgetFile(db, fileID)
    if (!file){ return noContent(rm101005) }
    return Response.json(file, {status: 200})
}