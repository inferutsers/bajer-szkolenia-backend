import getDatabase from "@/connection/database"
import { getDateLong } from "@/functions/dates"
import generateInvoicePDF from "@/functions/invoices/generateInvoicePDF"
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
    invoiceVat = headers.get("invoiceVAT")
    if (!sessionID || !isCompany || !serviceName || !servicePrice || !clientPayment || !invoiceVat) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const invoiceNumber = `${(await db.query('SELECT "integerValue" FROM "options" WHERE "id" = 0 LIMIT 1')).rows[0].integerValue}/${(new Date).getFullYear()}`
    const invoiceString = generateInvoicePDF(Number(invoiceVat), invoiceNumber, Boolean(JSON.parse(isCompany)), Number(servicePrice), utf8.decode(serviceName), Number(clientPayment), clientName ? utf8.decode(clientName) : undefined, clientSurname ? utf8.decode(clientSurname) : undefined, undefined, undefined, !clientPhonenumber ? undefined : clientPhonenumber, !clientEmail ? undefined : utf8.decode(clientEmail), !clientAdress ? undefined : utf8.decode(clientAdress), !clientCompanyName ? undefined : utf8.decode(clientCompanyName), !clientCompanyNIP ? undefined : clientCompanyNIP)
    const invoiceBuffer = Buffer.from(invoiceString, 'binary')
    await db.query('INSERT INTO "invoices"("number", "file", "date", "email") VALUES ($1, $2, $3, $4)', [invoiceNumber, invoiceBuffer, getDateLong(), clientEmail == "" ? undefined : clientEmail])
    await db.query('UPDATE "options" SET "integerValue" = "integerValue" + 1 WHERE "id" = 0')
    return NextResponse.json(invoiceBuffer, {status: 200})
}