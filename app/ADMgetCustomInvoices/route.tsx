import getDatabase from "@/connection/database"
import { getCustomInvoices } from "@/functions/queries/invoices"
import validateSession from "@/functions/validateSession"
import { badRequest, noContent, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const invoices = await getCustomInvoices(db)
    if (!invoices) { return noContent }
    return NextResponse.json(invoices, {status: 200})
}