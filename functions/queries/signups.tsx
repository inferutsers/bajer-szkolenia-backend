import signupElement from "@/interfaces/signupElement";
import { native, Pool } from "pg";
import getCourseName from "../getCourseName";
import getInvoiceNumber from "../invoices/getInvoiceNumber";
import mailStructure from "@/interfaces/mailStructure";
import { getDateLong } from "../dates";
import getCoursePrice from "../getCoursePrice";
import getOfferPrice from "../getOfferPrice";
import getOfferName from "../getOfferName";
import getCourseDate from "../getCourseDate";
import getOfferDate from "../getOfferDate";

export async function addPaymentToSignup(db: Pool, id: string | number, amount: string | number): Promise<signupElement | undefined>{
    const signup = await db.query('UPDATE "signups" SET "paidIn" = "paidIn" + $1 WHERE "id" = $2 AND "invalidated" = false RETURNING *', [amount, id])
    if (!signup || signup.rowCount == 0) { return undefined }
    return await formatAsSignupElement(signup.rows[0], db)
}

export async function addEmailSentToSignup(db: Pool, id: string | number, mailSent: mailStructure, reminderMail: boolean = false){
    if (reminderMail){
        await db.query('UPDATE signups SET "emailsSent" = ARRAY_APPEND("emailsSent", $1), "reminderSent" = true WHERE "id" = $2', [mailSent, id])
    } else {
        await db.query('UPDATE signups SET "emailsSent" = ARRAY_APPEND("emailsSent", $1) WHERE "id" = $2', [mailSent, id])
    }
}

export async function createSignup(db: Pool, name: string, surname: string, email: string, phoneNumber: string, adress: string, pesel: string | undefined = undefined, isCompany: string, companyName: string | undefined = undefined, companyNIP: string | undefined = undefined, courseID: string | number | undefined, offerID: string | number | undefined, price: string | number, attendees: string[]): Promise<signupElement | undefined>{
    const signup = await db.query('INSERT INTO signups("id", "name", "surname", "email", "phoneNumber", "isCompany", "companyName", "adress", "companyNIP", "date", "courseID", "supPrice", "pesel", "attendees", "offerID") VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *', [name, surname, email, phoneNumber, isCompany, companyName, adress, companyNIP, getDateLong(), courseID, price, pesel, attendees, offerID])
    if (!signup || signup.rowCount == 0) { return undefined }
    return await formatAsSignupElement(signup.rows[0], db)
}

export async function updateSignup(db: Pool, id: string, name: string, surname: string, email: string, phoneNumber: string, adress: string, pesel: string | undefined = undefined, isCompany: string, companyName: string | undefined = undefined, companyNIP: string | undefined = undefined, supPrice: string, attendees: string[]): Promise<signupElement | undefined>{
    const signup = await db.query('UPDATE "signups" SET "name" = $1, "surname" = $2, "email" = $3, "phoneNumber" = $4, "isCompany" = $5, "companyName" = $6, "adress" = $7, "companyNIP" = $8, "supPrice" = $9, "pesel" = $10, "attendees" = $11 WHERE "id" = $12 AND "invalidated" = false RETURNING *', [name, surname, email, phoneNumber, isCompany, companyName, adress, companyNIP, supPrice, pesel, attendees, id])
    if (!signup || signup.rowCount == 0) { return undefined }
    return await formatAsSignupElement(signup.rows[0], db)
}

export async function getSignups(db: Pool): Promise<signupElement[] | undefined>{
    const signups = await db.query('SELECT * FROM "signups" WHERE "invalidated" = false ORDER BY "date" DESC')
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

export async function invalidateSignup(db: Pool, id: number | string): Promise<boolean>{
    const signup = await db.query('UPDATE "signups" SET "invalidated" = true WHERE "id" = $1', [id])
    if (!signup || signup.rowCount != 1) { return false }
    return true
}

export async function deleteSignup(db: Pool, id: number | string){
    await db.query('DELETE FROM signups WHERE id = $1', [id])
}

export async function formatAsSignupElement(row: any, db: Pool): Promise<signupElement>{
    const price = row.courseID ? (await getCoursePrice(db, row.courseID)) : (row.offerID ? (await getOfferPrice(db, row.offerID)) : -1)
    const servicename = row.courseID ? (await getCourseName(db, row.courseID)) : (row.offerID ? (await getOfferName(db, row.offerID)) : "nieznana usluga")
    const servicedate = row.courseID ? (await getCourseDate(db, row.courseID)) : (row.offerID? (await getOfferDate(db, row.offerID)): new Date)
    return {id: row.id, name: row.name, surname: row.surname, email: row.email, phoneNumber: row.phoneNumber, isCompany: row.isCompany, companyName: row.companyName, adress: row.adress, companyNIP: row.companyNIP, date: row.date, courseID: row.courseID, offerID: row.offerID, supPrice: row.supPrice, emailsSent: row.emailsSent, paidIn: row.paidIn, invoiceNumber: await getInvoiceNumber(db, row.id), serviceName: servicename, pesel: row.pesel, attendees: row.attendees, servicePrice: price, serviceDate: servicedate, reminderSent: row.reminderSent}
}