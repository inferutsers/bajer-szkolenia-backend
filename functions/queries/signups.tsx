import signupElement from "@/interfaces/signupElement";
import { Pool } from "pg";
import mailStructure from "@/interfaces/mailStructure";
import { getDateLong } from "../dates";

const baseSelect = `SELECT
    "s"."id" AS "S_ID",
    "s"."name" AS "S_NAME",
    "s"."surname" AS "S_SURNAME",
    "s"."email" AS "S_EMAIL",
    "s"."phoneNumber" AS "S_PHONENUMBER",
    "s"."isCompany" AS "S_ISCOMPANY",
    "s"."companyName" AS "S_COMPANYNAME",
    "s"."adress" AS "S_ADRESS",
    "s"."companyNIP" AS "S_COMPANYNIP",
    "s"."date" AS "S_DATE",
    "s"."supPrice" AS "S_SUPPRICE",
    "s"."emailsSent" AS "S_EMAILSSENT",
    "s"."paidIn" AS "S_PAIDIN",
    "s"."pesel" AS "S_PESEL",
    "s"."attendees" AS "S_ATTENDEES",
    "s"."reminderSent" AS "S_REMINDERSENT",
    "s"."permissionRequired" AS "S_PERMISSIONREQUIRED",
    "c"."id" AS "C_ID",
    "c"."date" AS "C_DATE",
    "c"."title" AS "C_TITLE",
    "c"."place" AS "C_PLACE", 
    "c"."instructor" AS "C_INSTRUCTOR",
    "c"."note" AS "C_NOTE",
    "c"."price" AS "C_PRICE",
    "c"."span" AS "C_SPAN",
    "c"."slots" AS "C_SLOTS",
    "c"."available" AS "C_AVAILABLE",
    "c"."dateCreated" AS "C_DATECREATED",
    "c"."fileName" AS "C_FILENAME",
    "c"."customURL" AS "C_CUSTOMURL",
    "c"."permissionRequired" AS "C_PERMISSIONREQUIRED",
    "i"."number" AS "I_NUMBER"
    FROM "signups" "s"
    LEFT JOIN "courses" "c" ON "s"."courseID" = "c"."id" AND "c"."archived" = false
    LEFT JOIN "invoices" "i" ON "s"."id" = "i"."signup"
`
const baseWhere = 'WHERE "s"."invalidated" = false AND "s"."archived" = false'
const baseSelectOrder = 'ORDER BY "s"."date" DESC'

export async function signupTechnicalBreak(db: Pool): Promise<string | undefined>{
    const message = await db.query(`SELECT "stringValue" FROM "options" WHERE "id" = 2 AND "integerValue" > 0 LIMIT 1`)
    if (!message?.rowCount) { return undefined }
    return message.rows[0].stringValue
}

export async function addPaymentToSignup(db: Pool, id: string | number, amount: string | number): Promise<signupElement | undefined>{
    const signup = await db.query(`UPDATE "signups" "s" SET "paidIn" = "paidIn" + $1 ${baseWhere} AND "id" = $2`, [amount, id])
    if (!signup?.rowCount) { return undefined }
    return await getSignup(db, id)
}

export async function addEmailSentToSignup(db: Pool, id: string | number, mailSent: mailStructure, reminderMail: boolean = false){
    await db.query(`UPDATE signups SET "emailsSent" = ARRAY_APPEND("emailsSent", $1) ${reminderMail ? ', "reminderSent" = true' : ""} WHERE "id" = $2`, [mailSent, id])
}

export async function createSignup(db: Pool, name: string, surname: string, email: string, phoneNumber: string, adress: string, pesel: string | undefined = undefined, isCompany: string, companyName: string | undefined = undefined, companyNIP: string | undefined = undefined, courseID: string | number | undefined, offerID: string | number | undefined, price: string | number, attendees: string[], coursePermissionRequired: number): Promise<signupElement | undefined>{
    const signup = await db.query('INSERT INTO signups("id", "name", "surname", "email", "phoneNumber", "isCompany", "companyName", "adress", "companyNIP", "date", "courseID", "supPrice", "pesel", "attendees", "offerID", "permissionRequired") VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING "id"', [name, surname, email, phoneNumber, isCompany, companyName, adress, companyNIP, getDateLong(), courseID, price, pesel, attendees, offerID, coursePermissionRequired])
    if (!signup?.rowCount) { return undefined }
    return await getSignup(db, signup.rows[0].id)
}

export async function updateSignup(db: Pool, id: string, name: string, surname: string, email: string, phoneNumber: string, adress: string, pesel: string | undefined = undefined, isCompany: string, companyName: string | undefined = undefined, companyNIP: string | undefined = undefined, supPrice: string, attendees: string[]): Promise<signupElement | undefined>{
    const signup = await db.query(`UPDATE "signups" "s" SET 
        "name" = $1,
        "surname" = $2,
        "email" = $3,
        "phoneNumber" = $4,
        "isCompany" = $5,
        "companyName" = $6,
        "adress" = $7,
        "companyNIP" = $8,
        "supPrice" = $9,
        "pesel" = $10,
        "attendees" = $11 
        ${baseWhere} AND "id" = $12`, 
        [
            name, 
            surname, 
            email, 
            phoneNumber, 
            isCompany, 
            companyName, 
            adress, 
            companyNIP, 
            supPrice, 
            pesel, 
            attendees, 
            id
        ])
    if (!signup?.rowCount) { return undefined }
    return await getSignup(db, id)
}

export async function getCourseSignups(db: Pool, id: number | string): Promise<signupElement[] | undefined>{
    const signups = await db.query(`${baseSelect} ${baseWhere} AND "c"."id" = $1 ${baseSelectOrder}`, [id])
    if (!signups?.rowCount) { return undefined }
    return signups.rows.map(result => formatAsSignupElement(result))
}

export async function getSignups(db: Pool, archive: boolean = false): Promise<signupElement[] | undefined>{
    const signups = await db.query(`${baseSelect} WHERE "s"."invalidated" = false AND "s"."archived" = $1 ${baseSelectOrder}`, [archive])
    if (!signups?.rowCount) { return undefined }
    return signups.rows.map(result => formatAsSignupElement(result))
}

export async function getSignup(db: Pool, id: number | string, archive: boolean = false): Promise<signupElement | undefined>{
    const signup = await db.query(`${baseSelect} WHERE "s"."invalidated" = false AND "s"."archived" = $1 AND "s"."id" = $2 LIMIT 1`, [archive, id])
    if (!signup?.rowCount) { return undefined }
    return formatAsSignupElement(signup.rows[0])
}

export async function invalidateSignup(db: Pool, id: number | string): Promise<boolean>{
    const signup = await db.query(`UPDATE "signups" "s" SET "invalidated" = true ${baseWhere} AND "id" = $1`, [id])
    if (!signup?.rowCount) { return false }
    return true
}

export async function archiveSignupsByCourse(db: Pool, courseID: number): Promise<number>{
    const archived = await db.query(`UPDATE "signups" "s" SET "archived" = true ${baseWhere} AND "courseID" = $1`, [courseID])
    return archived.rowCount ?? 0
}

export async function deleteSignup(db: Pool, id: number | string){
    await db.query('DELETE FROM signups WHERE id = $1 AND "archived" = false', [id])
}

export function formatAsSignupElement(row: any): signupElement{
    return {
        id: row.S_ID,
        name: row.S_NAME,
        surname: row.S_SURNAME,
        email: row.S_EMAIL, 
        phoneNumber: row.S_PHONENUMBER, 
        isCompany: row.S_ISCOMPANY, 
        companyName: row.S_COMPANYNAME,
        adress: row.S_ADRESS,
        companyNIP: row.S_COMPANYNIP,
        date: row.S_DATE, 
        courseID: row.C_ID,
        offerID: undefined, 
        supPrice: row.S_SUPPRICE,
        emailsSent: row.S_EMAILSSENT, 
        paidIn: row.S_PAIDIN, 
        invoiceNumber: row.I_NUMBER,
        serviceName: row.C_TITLE, 
        pesel: row.S_PESEL,
        attendees: row.S_ATTENDEES, 
        servicePrice: row.C_PRICE, 
        serviceDate: row.C_DATE, 
        reminderSent: row.S_REMINDERSENT,
        permissionRequired: row.S_PERMISSIONREQUIRED 
    }
}