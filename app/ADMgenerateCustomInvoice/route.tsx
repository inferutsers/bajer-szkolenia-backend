import getDatabase from "@/connection/database"
import generateInvoicePDF from "@/functions/invoices/generateInvoicePDF"
import { insertInvoice, invoiceNumberingGetNumber, invoiceNumberingPlusOne } from "@/functions/queries/invoices"
import validateSession from "@/functions/validateSession"
import { badRequest, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    clientName = headers.get("clientName"),
    clientSurname = headers.get("clientSurname"),
    isCompany = headers.get("isCompany"),
    clientCompanyName = headers.get("clientCompanyName"),
    servicePrice = headers.get("servicePrice"),
    serviceName = headers.get("serviceName"),
    clientPayment = headers.get("clientPayment"),
    clientPhonenumber = headers.get("clientPhonenumber"),
    clientEmail = headers.get("clientEmail"),
    clientAdress = headers.get("clientAdress"),
    clientCompanyNIP = headers.get("clientCompanyNIP"),
    invoiceVat = headers.get("invoiceVAT"),
    clientPesel = headers.get("clientPesel")
    if (!sessionID || !isCompany || !serviceName || !servicePrice || !clientPayment || !invoiceVat || !clientAdress) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const invoiceNumber = await invoiceNumberingGetNumber(db)
    const invoiceString = generateInvoicePDF(Number(invoiceVat), invoiceNumber, Boolean(JSON.parse(isCompany)), utf8.decode(clientAdress), Number(servicePrice), utf8.decode(serviceName), Number(clientPayment), clientName ? utf8.decode(clientName) : undefined, clientSurname ? utf8.decode(clientSurname) : undefined, undefined, !clientPhonenumber ? undefined : clientPhonenumber, !clientEmail ? undefined : utf8.decode(clientEmail), !clientCompanyName ? undefined : utf8.decode(clientCompanyName), !clientCompanyNIP ? undefined : clientCompanyNIP, !clientPesel ? undefined : clientPesel)
    const invoiceBuffer = Buffer.from(invoiceString, 'binary')
    await insertInvoice(db, undefined, invoiceNumber, invoiceBuffer)
    await invoiceNumberingPlusOne(db)
    return NextResponse.json(invoiceBuffer, {status: 200})
}