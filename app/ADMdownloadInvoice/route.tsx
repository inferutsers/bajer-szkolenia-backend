import getDatabase from "@/connection/database"
import { getSignupInvoiceFile } from "@/functions/queries/invoices"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm021007 } from "@/responses/messages"
import { badRequest, notFound, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const invoice = await getSignupInvoiceFile(db, signupID)
    if (!invoice) { return notFound(rm021007) }
    return NextResponse.json(invoice, {status: 200})
}