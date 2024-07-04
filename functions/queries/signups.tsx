import signupElement from "@/interfaces/signupElement";
import { Pool } from "pg";
import getCourseName from "../getCourseName";
import getInvoiceNumber from "../invoices/getInvoiceNumber";

export async function getSignups(db: Pool): Promise<signupElement[] | undefined>{
    const signups = await db.query('SELECT * FROM "signups" WHERE "invalidated" = false ORDER BY "date" DESC')
    if (!signups || signups.rowCount == 0) { return undefined }
    const formattedSignups: signupElement[] = await Promise.all(signups.rows.map(async (result) => await formatAsSignupElement(result, db)))
    return formattedSignups
}

export async function getCourseSignups(db: Pool, id: number | string): Promise<signupElement[] | undefined>{
    const signups = await db.query('SELECT * FROM "signups" WHERE "invalidated" = false AND "courseID" = $1 ORDER BY "date" DESC', [id])
    if (!signups || signups.rowCount == 0) { return undefined }
    const formattedSignups: signupElement[] = await Promise.all(signups.rows.map(async (result) => await formatAsSignupElement(result, db)))
    return formattedSignups
}

export async function getSignup(db: Pool, id: number | string): Promise<signupElement | undefined>{
    const signup = await db.query('SELECT * FROM "signups" WHERE "id" = $1 AND "invalidated" = false LIMIT 1', [id])
    if (!signup || signup.rowCount == 0) { return undefined }
    const formattedSignup = formatAsSignupElement(signup.rows[0], db)
    return formattedSignup
}

export async function formatAsSignupElement(row: any, db: Pool): Promise<signupElement>{
    return {id: row.id, name: row.name, surname: row.surname, email: row.email, phoneNumber: row.phoneNumber, isCompany: row.isCompany, companyName: row.companyName, companyAdress: row.companyAdress, companyNIP: row.companyNIP, date: row.date, courseID: row.courseID, supPrice: row.supPrice, emailsSent: row.emailsSent, paidIn: row.paidIn, invoiceNumber: await getInvoiceNumber(db, row.id), courseName: await getCourseName(db, row.courseID)}
}