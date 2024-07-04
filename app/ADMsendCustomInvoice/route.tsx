import getDatabase from "@/connection/database"
import { getCustomInvoice, getCustomInvoiceFile } from "@/functions/queries/invoices"
import { sendCustomInvoice } from "@/functions/sendCustomInvoice"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    invoiceRecordID = headers.get("invoiceRecordID")
    if (!sessionID || !invoiceRecordID) { return badRequest }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const invoice = await getCustomInvoice(db, invoiceRecordID)
    if (!invoice) { return notFound }
    if (!invoice.email) { return unprocessableContent }
    const invoiceFile = await getCustomInvoiceFile(db, invoiceRecordID)
    if (!invoiceFile) { return unprocessableContent }
    const mailSent = await sendCustomInvoice(db, invoice.email!, invoice.number, invoiceFile)
    if (!mailSent) { return unprocessableContent }
    return NextResponse.json(null, {status: 200})
}