import getDatabase from "@/connection/database"
import { getCustomInvoiceFile } from "@/functions/queries/invoices"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm051000 } from "@/responses/messages"
import { badRequest, notFound, unauthorized } from "@/responses/responses"

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    invoiceRecordID = headers.get("invoiceRecordID")
    if (!sessionID || !invoiceRecordID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const invoice = await getCustomInvoiceFile(db, invoiceRecordID)
    if (!invoice) { return notFound(rm051000) }
    return Response.json(invoice, {status: 200})
}