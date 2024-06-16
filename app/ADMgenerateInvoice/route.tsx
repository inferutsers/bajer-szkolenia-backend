import getDatabase from "@/connection/database";
import getCourseSignupCount from "@/functions/getCourseSignupCount";
import validateSession from "@/functions/validateSession";
import ADMcourseElement from "@/interfaces/ADMcourseElement";
import signupElement from "@/interfaces/signupElement";
import { badRequest, conflict, gone, notFound, serviceUnavailable, unauthorized } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";
import generateInvoice from "@/functions/generateInvoice";
import mailStructure from "@/interfaces/mailStructure";
import sendSingleEmailWithAttachment from "@/functions/sendSingleEmailWithAttachment";
import { Attachment } from "nodemailer/lib/mailer";
import fs from "fs";

export async function GET(req: NextRequest, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signupArray = await db.query('SELECT * FROM "signups" WHERE "id" = $1 LIMIT 1', [signupID])
    if (!signupArray || signupArray.rowCount == 0) { return notFound }
    const signup: signupElement = signupArray.rows.map((result) => ({id: result.id, name: result.name, surname: result.surname, email: result.email, phoneNumber: result.phoneNumber, isCompany: result.isCompany, companyName: result.companyName, companyAdress: result.companyAdress, companyNIP: result.companyNIP, date: result.date, courseID: result.courseID, supPrice: result.supPrice, emailsSent: result.emailsSent, paidIn: result.paidIn, invoices: result.invoices}))[0]
    const signupInvoicesArray = await db.query('SELECT "id" FROM "invoices" WHERE "signup" = $1 LIMIT 1', [signupID])
    if (signupInvoicesArray.rowCount as number > 0) { return conflict }
    if (signup.isCompany && (!signup.companyAdress || !signup.companyNIP || !signup.companyName)) { return serviceUnavailable }
    const courseArray = await db.query('SELECT * FROM "courses" WHERE "id" = $1 LIMIT 1', [signup.courseID])
    if (!courseArray || courseArray.rowCount == 0) { return gone }
    const course: ADMcourseElement = (await Promise.all(courseArray.rows.map(async (result) => ({ id: result.id, date: result.date, span: result.span, price: result.price, title: result.title, place: result.place, instructor: result.instructor, note: result.note, slots: result.slots, slotsUsed: await getCourseSignupCount(db, result.id), available: result.available }))))[0]
    if (!course.title) { return serviceUnavailable }
    const invoiceNumber = `${(await db.query('SELECT "integerValue" FROM "options" WHERE "id" = 0 LIMIT 1')).rows[0].integerValue}/${(new Date).getFullYear()}`
    const pdfBuffer = Buffer.from(generateInvoice(signup, course, invoiceNumber), 'binary')
    await db.query('INSERT INTO "invoices"("signup", "number", "file") VALUES ($1, $2, $3)', [signup.id, invoiceNumber, pdfBuffer])
    await db.query('UPDATE "options" SET "integerValue" = "integerValue" + 1 WHERE "id" = 0')
    const mailAttachment: Attachment = {
        content: pdfBuffer,
        filename: `Faktura${signup.id}.pdf`
    }
    const mailContentHTML = fs.readFileSync("/home/ubuntu/backend/templates/invoice.html", 'utf-8').replaceAll("{name}", signup.name as string).replaceAll("{surname}", signup.surname as string).replaceAll("{invoiceno}", invoiceNumber).replaceAll("{topay}", String(signup.supPrice as number - (signup.paidIn as number)))
    const mailContentRaw = fs.readFileSync("/home/ubuntu/backend/templates/invoice.txt", 'utf-8').replaceAll("{name}", signup.name as string).replaceAll("{surname}", signup.surname as string).replaceAll("{invoiceno}", invoiceNumber).replaceAll("{topay}", String(signup.supPrice as number - (signup.paidIn as number)))
    const mailSent: mailStructure = await sendSingleEmailWithAttachment(signup.email, "Faktura VAT", mailContentRaw, mailContentHTML, mailAttachment)
    if(mailSent.failure == false) {
        await db.query('UPDATE signups SET "emailsSent" = ARRAY_APPEND("emailsSent", $1) WHERE "id" = $2', [mailSent, signup.id])
        return NextResponse.json({mailSent: true}, {status: 200})
    } else {
        return NextResponse.json({mailSent: false}, {status: 200})
    }
}
