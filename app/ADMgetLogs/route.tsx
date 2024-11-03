import getDatabase from "@/connection/database";
import { getLogs } from "@/functions/queries/logs";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm110001 } from "@/responses/messages";
import { badRequest, noContent, unauthorized } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser || validatedUser.status < 10) { return unauthorized(rm001000) }
    const logs = await getLogs(db)
    if (!logs){ return noContent(rm110001) }
    return Response.json(logs, {status: 200})
}