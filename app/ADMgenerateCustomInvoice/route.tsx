import getDatabase from "@/connection/database"
import BIR11NipSearch from "@/functions/bir11/complete"
import { getDateShortReadable } from "@/functions/dates"
import generateInvoicePDF from "@/functions/invoices/generateInvoicePDF"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { insertInvoice, insertRamzesDataToInvoice, invoiceNumberingGetNumber, invoiceNumberingPlusOne } from "@/functions/queries/invoices"
import checkIfTaxPayer from "@/functions/taxPayerList/checkIfTaxPayer"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm051001, rm051006 } from "@/responses/messages"
import { badRequest, unauthorized, unprocessableContent } from "@/responses/responses"
import utf8 from "utf8"

export async function POST(req: Request){
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
    if (!sessionID || !isCompany || !serviceName || !servicePrice || !clientPayment || !invoiceVat || !clientAdress) { return badRequest(rm001001) }
    if (isCompany == 'true' && clientCompanyNIP!.length != 10) { return unprocessableContent(rm051001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const invoiceNumber = await invoiceNumberingGetNumber(db)
    const invoiceString = generateInvoicePDF(Number(invoiceVat), invoiceNumber, Boolean(JSON.parse(isCompany)), utf8.decode(clientAdress), Number(servicePrice), utf8.decode(serviceName), Number(clientPayment), 1, clientName ? utf8.decode(clientName) : undefined, clientSurname ? utf8.decode(clientSurname) : undefined, undefined, !clientPhonenumber ? undefined : clientPhonenumber, !clientEmail ? undefined : utf8.decode(clientEmail), !clientCompanyName ? undefined : utf8.decode(clientCompanyName), !clientCompanyNIP ? undefined : clientCompanyNIP, !clientPesel ? undefined : clientPesel)
    const invoiceBuffer = Buffer.from(invoiceString, 'binary')
    const invoiceID = await insertInvoice(db, undefined, invoiceNumber, invoiceBuffer, clientEmail ? clientEmail : undefined)
    if (!invoiceID) { systemLog(systemAction.ADMgenerateCustomInvoice, systemActionStatus.error, rm051006, validatedUser, db); return unprocessableContent(rm051006) }
    const invoiceRamzesKontrahent = {
        knt_Id: invoiceID,
        knt_Nazwa: (isCompany == 'true' ? clientCompanyName! : `${clientName} ${clientSurname}`),
        knt_Nip: clientCompanyNIP,
        knt_Pesel: clientPesel,
        knt_Regon: (isCompany == 'true' ? (((await BIR11NipSearch(clientCompanyNIP!)) as any)?.Regon[0]) : undefined),
        knt_Kod: clientAdress.split("|=|")[1],
        knt_Miasto: clientAdress.split("|=|")[2],
        knt_Ulica: clientAdress.split("|=|")[0],
        knt_DMP: "F",
        knt_CPV: (isCompany == 'true' ? (await checkIfTaxPayer(clientCompanyNIP!)) : false) ? "F" : "T"
    }
    const invoiceRamzesNagdok = {
        dok_KntId: invoiceID,
        dok_DokId: invoiceID,
        dok_Numer: invoiceNumber,
        dok_DataDat: getDateShortReadable(),
        dok_DataOper: getDateShortReadable(),
        dok_DataZap: getDateShortReadable(),
        dok_Opis: serviceName,
        dok_Typ: "1",
        dok_DokFoz: "2",
        dok_JPK: "12"
    }
    const vatAmount = Number(servicePrice) - (Number(servicePrice) / (1 + (Number(invoiceVat) / 100)))
    const invoiceRamzesDekret = {
        dod_DokId: invoiceID,
        dod_PozNet: servicePrice,
        dod_PozBru: servicePrice,
        dod_PozVat: vatAmount,
        dod_PozSvt: invoiceVat == "0" ? "ZW" : invoiceVat
    }
    await insertRamzesDataToInvoice(db, invoiceID, invoiceRamzesKontrahent, invoiceRamzesNagdok, invoiceRamzesDekret)
    await invoiceNumberingPlusOne(db)
    systemLog(systemAction.ADMgenerateCustomInvoice, systemActionStatus.success, `Wystawiono własną fakturę #${invoiceNumber}`, validatedUser, db);
    return Response.json(invoiceBuffer, {status: 200})
}