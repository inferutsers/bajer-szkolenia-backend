import { customInvoice } from "@/interfaces/customInvoice";
import { Pool } from "pg";

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

export async function getCustomInvoices(db: Pool): Promise<customInvoice[]>{
    const invoices = await db.query('SELECT * FROM "invoices" WHERE "signup" IS NULL')
    if (!invoices || invoices.rowCount == 0) { return [] }
    return invoices.rows.map((result) => formatAsCustomInvoiceElement(result))
}

export async function getCustomInvoiceFile(db: Pool, invoiceRecordID: string | number): Promise<Buffer | undefined>{
    const invoice = await db.query('SELECT * FROM "invoices" WHERE "signup" IS NULL AND "id" = $1 LIMIT 1', [invoiceRecordID])
    if (!invoice || invoice.rowCount == 0) { return undefined }
    return invoice.rows[0].file as Buffer
}

export function formatAsCustomInvoiceElement(row: any): customInvoice{
    return { id: row.id, signup: row.signup, number: row.number }
}