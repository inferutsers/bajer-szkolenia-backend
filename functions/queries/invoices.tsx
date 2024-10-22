import { customInvoice } from "@/interfaces/customInvoice";
import { Pool } from "pg";
import { getDateLong } from "../dates";

export async function invoiceNumberingPlusOne(db: Pool){
    await db.query('UPDATE "options" SET "integerValue" = "integerValue" + 1 WHERE "id" = 0')
}

export async function invoiceNumberingGetNumber(db: Pool): Promise<string>{
    return `${(await db.query('SELECT "integerValue" FROM "options" WHERE "id" = 0 LIMIT 1')).rows[0].integerValue}/${(new Date).getFullYear()}`
}

export async function insertInvoice(db: Pool, signupID: number | undefined = undefined, invoiceNumber: string, invoicePDF: Buffer | null, email?: string): Promise<string | undefined>{
    const invoice = await db.query('INSERT INTO "invoices"("signup", "number", "file", "date", "email") VALUES ($1, $2, $3, $4, $5) RETURNING "id"', [signupID, invoiceNumber, invoicePDF, getDateLong(), email])
    if (!invoice || invoice.rowCount == 0) { return undefined }
    return invoice.rows[0].id
}

export async function insertRamzesDataToInvoice(db: Pool, id: string, kontrahent: Object, nagdok: Object, dekret: Object){
    await db.query('UPDATE "invoices" SET "ramzesKontrahent" = $1, "ramzesNagdok" = $2, "ramzesDektet" = $3 WHERE "id" = $4', [kontrahent, nagdok, dekret, id])
}

export async function getInvoicesRamzesData(db: Pool, dateStart: string, dateEnd: string): Promise<undefined | {kontrahent: any, nagdok: any, dekret: any}[]>{
    const invoices = await db.query('SELECT "ramzesKontrahent", "ramzesNagdok", "ramzesDektet" FROM "invoices" WHERE "date" > $1 AND "date" < $2', [dateStart, dateEnd])
    if (!invoices || invoices.rowCount == 0){ return undefined }
    return invoices.rows.map((row) => ({kontrahent: row.ramzesKontrahent, nagdok: row.ramzesNagdok, dekret: row.ramzesDektet}))
}

export async function getSignupInvoiceCount(db: Pool, signupID: string | number): Promise<number>{
    const invoice = await db.query('SELECT "id" FROM "invoices" WHERE "signup" = $1 LIMIT 1', [signupID])
    if (!invoice) { return 0 }
    return invoice.rowCount as number
}

export async function getSignupInvoiceFile(db: Pool, signupID: string | number): Promise<Buffer | undefined>{
    const invoice = await db.query('SELECT * FROM "invoices" WHERE "signup" = $1 LIMIT 1', [signupID])
    if (!invoice || invoice.rowCount == 0) { return undefined }
    return invoice.rows[0].file as Buffer
}

export async function getSignupInvoiceFileRamzesXML(db: Pool, signupID: string | number): Promise<Buffer | undefined>{
    const invoice = await db.query('SELECT * FROM "invoices" WHERE "signup" = $1 LIMIT 1', [signupID])
    if (!invoice || invoice.rowCount == 0) { return undefined }
    return invoice.rows[0].ramzesxml as Buffer
}

export async function getCustomInvoices(db: Pool): Promise<customInvoice[]>{
    const invoices = await db.query('SELECT * FROM "invoices" WHERE "signup" IS NULL ORDER BY "date" DESC')
    if (!invoices || invoices.rowCount == 0) { return [] }
    return invoices.rows.map((result) => formatAsCustomInvoiceElement(result))
}

export async function getCustomInvoiceFile(db: Pool, invoiceRecordID: string | number): Promise<Buffer | undefined>{
    const invoice = await db.query('SELECT * FROM "invoices" WHERE "signup" IS NULL AND "id" = $1 LIMIT 1', [invoiceRecordID])
    if (!invoice || invoice.rowCount == 0) { return undefined }
    return invoice.rows[0].file as Buffer
}

export async function getCustomInvoiceFileRamzesXML(db: Pool, invoiceRecordID: string | number): Promise<Buffer | undefined>{
    const invoice = await db.query('SELECT * FROM "invoices" WHERE "signup" IS NULL AND "id" = $1 LIMIT 1', [invoiceRecordID])
    if (!invoice || invoice.rowCount == 0) { return undefined }
    return invoice.rows[0].ramzesxml as Buffer
}

export async function getCustomInvoice(db: Pool, invoiceRecordID: string | number): Promise<customInvoice | undefined>{
    const invoice = await db.query('SELECT * FROM "invoices" WHERE "signup" IS NULL AND "id" = $1 LIMIT 1', [invoiceRecordID])
    if (!invoice || invoice.rowCount == 0) { return undefined }
    return formatAsCustomInvoiceElement(invoice.rows[0])
}

export function formatAsCustomInvoiceElement(row: any): customInvoice{
    return { id: row.id, number: row.number, email: row.email, date: row.date, permissionRequired: row.permissionRequired }
}