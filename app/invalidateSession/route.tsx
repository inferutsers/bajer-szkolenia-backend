import getDatabase from "@/connection/database"
import { rm001001 } from "@/responses/messages"
import { badRequest } from "@/responses/responses"

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    await db.query('UPDATE "administration" SET "sessionID" = NULL, "sessionValidity" = NULL WHERE "sessionID" = $1', [sessionID])
    return Response.json(null, {status: 200})
}