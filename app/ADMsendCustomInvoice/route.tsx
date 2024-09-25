import getDatabase from "@/connection/database"
import { getCustomInvoice, getCustomInvoiceFile } from "@/functions/queries/invoices"
import { sendCustomInvoice } from "@/functions/emails/sendCustomInvoice"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import { rm001000, rm001001, rm051000, rm051003, rm051004, rm051005 } from "@/responses/messages"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    invoiceRecordID = headers.get("invoiceRecordID")
    if (!sessionID || !invoiceRecordID) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const invoice = await getCustomInvoice(db, invoiceRecordID)
    if (!invoice) { return notFound(rm051000) }
    if (!invoice.email) { return unprocessableContent(rm051004) }
    const invoiceFile = await getCustomInvoiceFile(db, invoiceRecordID)
    if (!invoiceFile) { return unprocessableContent(rm051005) }
    const mailSent = await sendCustomInvoice(db, invoice.email!, invoice.number, invoiceFile)
    if (!mailSent) { return unprocessableContent(rm051003) }
    return NextResponse.json(null, {status: 200})
}