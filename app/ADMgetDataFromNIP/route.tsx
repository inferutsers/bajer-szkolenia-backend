import getDatabase from '@/connection/database'
import BIR11NipSearch from '@/functions/bir11/complete'
import validateSession from '@/functions/validateSession'
import { badRequest, serviceUnavailable, unauthorized } from '@/responses/responses'
import { NextResponse } from 'next/server'

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    nip = headers.get("nip")
    if (!sessionID || !nip) { return badRequest }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const nipdata = await BIR11NipSearch(nip)
    if (!nipdata) { return serviceUnavailable }
    return NextResponse.json(nipdata)
}