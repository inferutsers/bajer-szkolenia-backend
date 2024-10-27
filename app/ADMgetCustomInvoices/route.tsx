import getDatabase from "@/connection/database"
import { getCustomInvoices } from "@/functions/queries/invoices"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm051100 } from "@/responses/messages"
import { badRequest, noContent, unauthorized } from "@/responses/responses"

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const invoices = await getCustomInvoices(db)
    if (!invoices) { return noContent(rm051100) }
    return Response.json(invoices, {status: 200})
}