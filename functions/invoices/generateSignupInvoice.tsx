import ADMcourseElement from "@/interfaces/ADMcourseElement";
import signupElement from "@/interfaces/signupElement";
import fs from "fs";
import { Pool } from "pg";
import generateInvoicePDF from "./generateInvoicePDF";
import { Attachment } from "nodemailer/lib/mailer";
import mailFormatAsInvoice from "../formattings/mailFormatAsInvoice";
import sendSingleEmailWithAttachment from "../emails/processor/sendSingleEmailWithAttachment";
import mailStructure from "@/interfaces/mailStructure";
import { getDateLong } from "../dates";

export default async function generateSignupInvoice(db: Pool, signup: signupElement, course: ADMcourseElement): Promise<{mailSent: boolean}>{
    const invoiceNumber = `${(await db.query('SELECT "integerValue" FROM "options" WHERE "id" = 0 LIMIT 1')).rows[0].integerValue}/${(new Date).getFullYear()}`
    const invoiceString = generateInvoicePDF(0, invoiceNumber, signup.isCompany, signup.supPrice, course.title, signup.paidIn, signup.name, signup.surname, signup.id, signup.phoneNumber, signup.email, signup.companyAdress, signup.companyName, signup.companyNIP)
    const invoiceBuffer = Buffer.from(invoiceString, 'binary')
    await db.query('INSERT INTO "invoices"("signup", "number", "file", "date") VALUES ($1, $2, $3, $4)', [signup.id, invoiceNumber, invoiceBuffer, getDateLong()])
    await db.query('UPDATE "options" SET "integerValue" = "integerValue" + 1 WHERE "id" = 0')
    const mailAttachment: Attachment = {
        content: invoiceBuffer,
        filename: `Faktura${signup.id}.pdf`
    }
    const mailContentHTML = mailFormatAsInvoice(fs.readFileSync("/home/ubuntu/backend/templates/invoice.html", 'utf-8'), signup, invoiceNumber)
    const mailContentRaw = mailFormatAsInvoice(fs.readFileSync("/home/ubuntu/backend/templates/invoice.txt", 'utf-8'), signup, invoiceNumber)
    const mailSent: mailStructure = await sendSingleEmailWithAttachment(signup.email, "Wystawiliśmy Fakturę", mailContentRaw, mailContentHTML, mailAttachment)
    if(mailSent.failure == false) {
        await db.query('UPDATE signups SET "emailsSent" = ARRAY_APPEND("emailsSent", $1) WHERE "id" = $2', [mailSent, signup.id])
        return {mailSent: true}
    } else {
        return {mailSent: false}
    }
}

