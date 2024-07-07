import getDatabase from "@/connection/database"
import { getCustomInvoiceFile } from "@/functions/queries/invoices"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    invoiceRecordID = headers.get("invoiceRecordID")
    if (!sessionID || !invoiceRecordID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const invoice = await getCustomInvoiceFile(db, invoiceRecordID)
    if (!invoice) { return notFound }
    return NextResponse.json(invoice, {status: 200})
}