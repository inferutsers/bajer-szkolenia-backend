import { Pool } from "pg"

export default async function getInvoiceNumber(db: Pool, id: Number): Promise<string | undefined>{
    const signupInvoicesArray = await db.query('SELECT "number" FROM "invoices" WHERE "signup" = $1 LIMIT 1', [id])
    if (!signupInvoicesArray || signupInvoicesArray.rowCount == 0) { return undefined }
    return signupInvoicesArray.rows[0].number
}