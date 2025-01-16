import getDatabase from "@/connection/database";
import validateSession from "@/functions/validateSession";
import { badRequest, conflict, gone, notFound, serviceUnavailable, unauthorized } from "@/responses/responses";
import generateSignupInvoice from "@/functions/invoices/generateSignupInvoice";
import { getSignup } from "@/functions/queries/signups";
import { getSignupInvoiceCount } from "@/functions/queries/invoices";
import { ADMgetArchivedCourse, ADMgetCourse } from "@/functions/queries/course";
import { getOffer } from "@/functions/queries/offer";
import { rm001000, rm001001, rm021000, rm021003, rm021008, rm021009, rm021011, rm021013, rm021021 } from "@/responses/messages";
import { systemLog } from "@/functions/logging/log";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";

export async function POST(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID"),
    archive = headers.get("archive")
    if (!sessionID || !signupID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID, archive === "true")
    if (!signup) { systemLog(systemAction.ADMgenerateInvoice, systemActionStatus.error, rm021000, validatedUser, db); return notFound(rm021000) }
    if (signup.permissionRequired > validatedUser.status) { systemLog(systemAction.ADMgenerateInvoice, systemActionStatus.error, rm001000, validatedUser, db); return unauthorized(rm001000) }
    const signupInvoicesCount = await getSignupInvoiceCount(db, signupID)
    if (signupInvoicesCount > 0) { systemLog(systemAction.ADMgenerateInvoice, systemActionStatus.error, rm021003, validatedUser, db); return conflict(rm021003) }
    if (signup.isCompany && (!signup.companyNIP || !signup.companyName)) { systemLog(systemAction.ADMgenerateInvoice, systemActionStatus.error, rm021013, validatedUser, db); return serviceUnavailable(rm021013) }
    if (signup.supPrice == 0) { systemLog(systemAction.ADMgenerateInvoice, systemActionStatus.error, rm021021, validatedUser, db); return serviceUnavailable(rm021021) }
    if (signup.courseID && !signup.offerID){ //COURSE
        const course = archive === "true" ? (await ADMgetArchivedCourse(db, signup.courseID)) : (await ADMgetCourse(db, signup.courseID))
        if (!course) { systemLog(systemAction.ADMgenerateInvoice, systemActionStatus.error, rm021008, validatedUser, db); return gone(rm021008) }
        const result = await generateSignupInvoice(db, signup, course)
        systemLog(systemAction.ADMgenerateInvoice, systemActionStatus.success, `Wystawiono fakturę #${result?.invoiceNumber} do zapisu #${signup.id}`, validatedUser, db);
        return Response.json(result, {status: 200})
    } else if (!signup.courseID && signup.offerID) { //OFFER
        const offer = await getOffer(db, signup.offerID)
        if (!offer) { systemLog(systemAction.ADMgenerateInvoice, systemActionStatus.error, rm021009, validatedUser, db); return gone(rm021009) }
        const result = await generateSignupInvoice(db, signup, undefined, offer)
        systemLog(systemAction.ADMgenerateInvoice, systemActionStatus.success, `Wystawiono fakturę #${result?.invoiceNumber} do zapisu #${signup.id}`, validatedUser, db);
        return Response.json(result, {status: 200})
    } else { systemLog(systemAction.ADMgenerateInvoice, systemActionStatus.error, rm021011, validatedUser, db); return serviceUnavailable(rm021011) }
}
