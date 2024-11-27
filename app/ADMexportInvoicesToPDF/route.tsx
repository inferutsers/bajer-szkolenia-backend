import getDatabase from '@/connection/database';
import { combineInvoices } from '@/functions/combineInvoices';
import { systemAction, systemActionStatus } from '@/functions/logging/actions';
import { systemLog } from '@/functions/logging/log';
import { getInvoicesFiles } from '@/functions/queries/invoices';
import validateSession from '@/functions/validateSession';
import { rm001000, rm001001, rm061000 } from '@/responses/messages';
import { badRequest, notFound, unauthorized } from '@/responses/responses';
export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    dateStart = headers.get("dateStart"),
    dateEnd = headers.get("dateEnd")
    if (!sessionID || !dateStart || !dateEnd) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const invoices = await getInvoicesFiles(db, dateStart, dateEnd)
    if (!invoices) { systemLog(systemAction.ADMexportInvoicesToPDF, systemActionStatus.error, rm061000, validatedUser, db); return notFound(rm061000) }
    const combinedInvoices = await combineInvoices(invoices)
    systemLog(systemAction.ADMexportInvoicesToPDF, systemActionStatus.success, `Eksport faktur do PDF\n${dateStart}\n${dateEnd}`, validatedUser, db)
    return Response.json(combinedInvoices, {status: 200})
}