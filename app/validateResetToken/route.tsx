import getDatabase from "@/connection/database"
import { getAdministratorByPRT } from "@/functions/queries/administration"
import { rm001001, rm001008 } from "@/responses/messages"
import { badRequest, notFound } from "@/responses/responses"

export async function GET(req: Request){
    const headers = req.headers,
    resetToken = headers.get("resetToken")
    if (!resetToken) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const accountFound = await getAdministratorByPRT(db, resetToken)
    if (!accountFound) { return notFound(rm001008) }
    return Response.json({login: accountFound.login}, {status: 200})
}