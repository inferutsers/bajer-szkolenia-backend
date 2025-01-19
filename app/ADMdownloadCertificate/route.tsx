import getDatabase from "@/connection/database"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { getCertificate } from "@/functions/queries/certificate"
import { getSignup } from "@/functions/queries/signups"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm131004 } from "@/responses/messages"
import { badRequest, notFound, unauthorized } from "@/responses/responses"

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const certificate = await getCertificate(db, signupID)
    if (!certificate) { systemLog(systemAction.ADMdownloadCertificate, systemActionStatus.error, rm131004, validatedUser, db); return notFound(rm131004) }
    return Response.json(certificate, {status: 200})
}