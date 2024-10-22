import getDatabase from "@/connection/database"
import { dumpObject, systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { getSignupInvoiceCount } from "@/functions/queries/invoices"
import { getSignup, invalidateSignup } from "@/functions/queries/signups"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm021000, rm021004, rm021005 } from "@/responses/messages"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID)
    if (!signup) { systemLog(systemAction.ADMcancelSignup, systemActionStatus.error, rm021000, validatedUser, db); return notFound(rm021000) }
    if (signup.permissionRequired > validatedUser.status) { systemLog(systemAction.ADMcancelSignup, systemActionStatus.error, rm001000, validatedUser, db); return unauthorized(rm001000) }
    const signupInvoiceCount = await getSignupInvoiceCount(db, signupID)
    if (signupInvoiceCount > 0) { systemLog(systemAction.ADMcancelSignup, systemActionStatus.error, rm021005, validatedUser, db); return unprocessableContent(rm021005) }
    const signupInvalidated = await invalidateSignup(db, signupID)
    if (!signupInvalidated) { systemLog(systemAction.ADMcancelSignup, systemActionStatus.error, rm021004, validatedUser, db); return unprocessableContent(rm021004) }
    systemLog(systemAction.ADMcancelSignup, systemActionStatus.success, `Anulowano zapis\n${dumpObject(signup)}`, validatedUser, db)
    return NextResponse.json(null, {status: 200})
} 