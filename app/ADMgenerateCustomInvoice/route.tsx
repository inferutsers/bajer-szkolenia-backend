import getDatabase from "@/connection/database"
import generateInvoicePDF from "@/functions/generateInvoicePDF"
import validateSession from "@/functions/validateSession"
import { badRequest, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"

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
    invoiceVat = headers.get("invoiceVAT")
    if (!sessionID || !clientName || !clientSurname || !isCompany || !serviceName || !servicePrice || !clientPayment || !invoiceVat) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const invoiceNumber = `${(await db.query('SELECT "integerValue" FROM "options" WHERE "id" = 0 LIMIT 1')).rows[0].integerValue}/${(new Date).getFullYear()}`
    const invoiceString = generateInvoicePDF(Number(invoiceVat), invoiceNumber, clientName, clientSurname, Boolean(JSON.parse(isCompany)), Number(servicePrice), serviceName, Number(clientPayment), undefined, undefined, !clientPhonenumber ? undefined : clientPhonenumber, !clientEmail ? undefined : clientEmail, !clientAdress ? undefined : clientAdress, !clientCompanyName ? undefined : clientCompanyName, !clientCompanyNIP ? undefined : clientCompanyNIP)
    const invoiceBuffer = Buffer.from(invoiceString, 'binary')
    await db.query('INSERT INTO "invoices"("number", "file") VALUES ($1, $2)', [invoiceNumber, invoiceBuffer])
    await db.query('UPDATE "options" SET "integerValue" = "integerValue" + 1 WHERE "id" = 0')
    return NextResponse.json(invoiceBuffer, {status: 200})
}