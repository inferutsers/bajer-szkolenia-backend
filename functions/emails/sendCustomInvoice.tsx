import mailFormatAsCustomInvoice from "../formattings/mailFormatAsCustomInvoice";
import fs from 'fs'
import mailStructure from "@/interfaces/mailStructure";
import sendSingleEmailWithAttachment from "./processor/sendSingleEmailWithAttachment";
import { Attachment } from "nodemailer/lib/mailer";

export async function sendCustomInvoice(email: string, invoiceNumber: string, file: Buffer): Promise<{mailSent: boolean}>{
    const mailContentHTML = mailFormatAsCustomInvoice(fs.readFileSync("/home/ubuntu/backend/templates/customInvoice.html", 'utf-8'), invoiceNumber)
    const mailContentRaw = mailFormatAsCustomInvoice(fs.readFileSync("/home/ubuntu/backend/templates/courseEmail.txt", 'utf-8'), invoiceNumber)
    const mailAttachment: Attachment = {
        content: file,
        filename: `Faktura.pdf`
    }
    const mailSent: mailStructure = await sendSingleEmailWithAttachment(email, "Wystawiliśmy Fakturę", mailContentRaw, mailContentHTML, mailAttachment)
    return {mailSent: !(mailSent.failure)}
}