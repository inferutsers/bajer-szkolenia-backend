import getDatabase from "@/connection/database";
import { ADMgetFiles } from "@/functions/queries/publicFiles";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm101004 } from "@/responses/messages";
import { badRequest, noContent, unauthorized } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const files = await ADMgetFiles(db)
    if (!files){ return noContent(rm101004) }
    return Response.json(files, {status: 200})
}