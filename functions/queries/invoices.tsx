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