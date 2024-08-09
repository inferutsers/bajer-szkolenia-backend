import ADMcourseElement from "@/interfaces/ADMcourseElement";
import signupElement from "@/interfaces/signupElement";
import fs from "fs";
import { Pool } from "pg";
import generateInvoicePDF from "./generateInvoicePDF";
import { Attachment } from "nodemailer/lib/mailer";
import mailFormatAsInvoice from "../formattings/mailFormatAsInvoice";
import sendSingleEmailWithAttachment from "../emails/processor/sendSingleEmailWithAttachment";
import mailStructure from "@/interfaces/mailStructure";
import { getDateShortReadable } from "../dates";
import BIR11NipSearch from "../bir11/complete";
import checkIfTaxPayer from "../taxPayerList/checkIfTaxPayer";
import { insertInvoice, insertRamzesDataToInvoice, invoiceNumberingGetNumber, invoiceNumberingPlusOne } from "../queries/invoices";
import { addEmailSentToSignup } from "../queries/signups";
import offerElement from "@/interfaces/offerElement";

export default async function generateSignupInvoice(db: Pool, signup: signupElement, course?: ADMcourseElement, offer?: offerElement): Promise<{mailSent: boolean} | undefined>{
    const invoiceNumber = await invoiceNumberingGetNumber(db)
    const invoiceString = generateInvoicePDF(0, invoiceNumber, signup.isCompany, signup.adress, signup.supPrice, course ? course.title : (offer ? offer.name : "Nieznana usluga"), signup.attendees.length, signup.paidIn, signup.name, signup.surname, signup.id, signup.phoneNumber, signup.email, signup.companyName, signup.companyNIP, signup.pesel)
    const invoiceBuffer = Buffer.from(invoiceString, 'binary')
    const invoiceID = await insertInvoice(db, signup.id, invoiceNumber, invoiceBuffer)
    if (!invoiceID) { return undefined }
    await invoiceNumberingPlusOne(db)
    const invoiceRamzesKontrahent = {
        knt_Id: signup.id,
        knt_Nazwa: (signup.isCompany ? signup.companyName! : `${signup.name} ${signup.surname}`),
        knt_Nip: signup.companyNIP,
        knt_Pesel: signup.pesel,
        knt_Regon: (signup.isCompany ? (((await BIR11NipSearch(signup.companyNIP!)) as any)?.Regon[0]) : undefined),
        knt_Kod: signup.adress.split("|=|")[1],
        knt_Miasto: signup.adress.split("|=|")[2],
        knt_Ulica: signup.adress.split("|=|")[0],
        knt_DMP: "F",
        knt_CPV: (signup.isCompany ? (await checkIfTaxPayer(signup.companyNIP!)) : false) ? "F" : "T"
    }
    const invoiceRamzesNagdok = {
        dok_KntId: signup.id,
        dok_DokId: invoiceID,
        dok_Numer: invoiceNumber,
        dok_DataDat: getDateShortReadable(),
        dok_DataOper: getDateShortReadable(),
        dok_DataZap: getDateShortReadable(),
        dok_Opis: `Szkolenie (${signup.attendees.length} osob)`,
        dok_Typ: "1",
        dok_DokFoz: "2",
        dok_JPK: "12"
    }
    const invoiceRamzesDekret = {
        dod_DokId: invoiceID,
        dod_PozNet: signup.supPrice,
        dod_PozBru: signup.supPrice,
        dod_PozVat: "0",
        dod_PozSvt: "ZW"
    }
    await insertRamzesDataToInvoice(db, invoiceID, invoiceRamzesKontrahent, invoiceRamzesNagdok, invoiceRamzesDekret)
    const mailAttachment: Attachment = {
        content: invoiceBuffer,
        filename: `Faktura${signup.id}.pdf`
    }
    const mailContentHTML = mailFormatAsInvoice(fs.readFileSync("/home/ubuntu/backend/templates/invoice.html", 'utf-8'), signup, invoiceNumber)
    const mailContentRaw = mailFormatAsInvoice(fs.readFileSync("/home/ubuntu/backend/templates/invoice.txt", 'utf-8'), signup, invoiceNumber)
    const mailSent: mailStructure = await sendSingleEmailWithAttachment(signup.email, "Wystawiliśmy Fakturę", mailContentRaw, mailContentHTML, mailAttachment)
    if(mailSent.failure == false) {
        await addEmailSentToSignup(db, signup.id, mailSent)
        return {mailSent: true}
    } else {
        return {mailSent: false}
    }
}

