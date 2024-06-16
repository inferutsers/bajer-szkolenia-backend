import getDatabase from "@/connection/database"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized } from "@/responses/responses"

export async function GET(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const invoiceArray = await db.query('SELECT * FROM "invoices" WHERE "signup" = $1 LIMIT 1', [signupID])
    if (!invoiceArray || invoiceArray.rowCount == 0) { return notFound }
    const invoice = invoiceArray.rows[0]
    const invoiceFile: Buffer = invoice.file
    const invoiceFileBlob: Blob = new Blob([invoiceFile])
    return new Response(invoiceFileBlob, {status: 200})
}