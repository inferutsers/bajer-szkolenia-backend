import getDatabase from "@/connection/database"
import { getCustomInvoice, getCustomInvoiceFile } from "@/functions/queries/invoices"
import { sendCustomInvoice } from "@/functions/emails/sendCustomInvoice"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { rm001000, rm001001, rm051000, rm051003, rm051004, rm051005 } from "@/responses/messages"
import { systemLog } from "@/functions/logging/log"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"

export async function POST(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    invoiceRecordID = headers.get("invoiceRecordID")
    if (!sessionID || !invoiceRecordID) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const invoice = await getCustomInvoice(db, invoiceRecordID)
    if (!invoice) { systemLog(systemAction.ADMsendCustomInvoice, systemActionStatus.error, rm051000, validatedUser, db); return notFound(rm051000) }
    if (!invoice.email) { systemLog(systemAction.ADMsendCustomInvoice, systemActionStatus.error, rm051004, validatedUser, db); return unprocessableContent(rm051004) }
    const invoiceFile = await getCustomInvoiceFile(db, invoiceRecordID)
    if (!invoiceFile) { systemLog(systemAction.ADMsendCustomInvoice, systemActionStatus.error, rm051005, validatedUser, db); return unprocessableContent(rm051005) }
    const mailSent = await sendCustomInvoice(invoice.email, invoice.number, invoiceFile)
    if (!mailSent) { systemLog(systemAction.ADMsendCustomInvoice, systemActionStatus.error, rm051003, validatedUser, db); return unprocessableContent(rm051003) }
    systemLog(systemAction.ADMsendCustomInvoice, systemActionStatus.success, `Wysłano własną fakturę #${invoice.number} do nabywcy`, validatedUser, db);
    return Response.json(null, {status: 200})
}