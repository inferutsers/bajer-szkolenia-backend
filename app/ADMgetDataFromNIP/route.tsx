import getDatabase from '@/connection/database'
import BIR11NipSearch from '@/functions/bir11/complete'
import validateSession from '@/functions/validateSession'
import { rm001000, rm001001, rm051002 } from '@/responses/messages'
import { badRequest, serviceUnavailable, unauthorized } from '@/responses/responses'
import { NextResponse } from 'next/server'

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    nip = headers.get("nip")
    if (!sessionID || !nip) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const nipdata = await BIR11NipSearch(nip)
    if (!nipdata) { return serviceUnavailable(rm051002) }
    return NextResponse.json(nipdata)
}