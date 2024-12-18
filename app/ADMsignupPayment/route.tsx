import getDatabase from "@/connection/database"
import generateSignupInvoice from "@/functions/invoices/generateSignupInvoice"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { ADMgetCourse } from "@/functions/queries/course"
import { getSignupInvoiceCount } from "@/functions/queries/invoices"
import { getOffer } from "@/functions/queries/offer"
import { addPaymentToSignup, getSignup } from "@/functions/queries/signups"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm021000, rm021006, rm021011, rm021014 } from "@/responses/messages"
import { badRequest, notAcceptable, notFound, serviceUnavailable, unauthorized, unprocessableContent } from "@/responses/responses"

export async function POST(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID"),
    paymentAmount = headers.get("paymentAmount"),
    archive = headers.get("archive")
    if (!sessionID || !signupID || !paymentAmount) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID, archive === "true")
    if (!signup) { systemLog(systemAction.ADMsignupPayment, systemActionStatus.error, rm021000, validatedUser, db); return notFound(rm021000) }
    if (signup.permissionRequired > validatedUser.status) { systemLog(systemAction.ADMsignupPayment, systemActionStatus.error, rm001000, validatedUser, db); return unauthorized(rm001000) }
    if ((signup.supPrice - signup.paidIn) < (Number(paymentAmount))) { systemLog(systemAction.ADMsignupPayment, systemActionStatus.error, rm021014, validatedUser, db); return notAcceptable(rm021014) }
    const updatedSignup = await addPaymentToSignup(db, signupID, paymentAmount)
    if (!updatedSignup) { systemLog(systemAction.ADMsignupPayment, systemActionStatus.error, rm021006, validatedUser, db); return unprocessableContent(rm021006) }
    if (updatedSignup.paidIn >= updatedSignup.supPrice && (await getSignupInvoiceCount(db, updatedSignup.id)) == 0 && updatedSignup.supPrice != 0) { 
        if (updatedSignup.courseID && !updatedSignup.offerID) { //COURSE
            const course = await ADMgetCourse(db, updatedSignup.courseID)
            if (course != undefined){
                const result = await generateSignupInvoice(db, updatedSignup, course)
                if (result) {
                    systemLog(systemAction.ADMsignupPayment, systemActionStatus.success, `Wystawiono fakturę #${result.invoiceNumber} do zapisu #${signup.id}`, validatedUser, db);
                }
            }
        } else if (!updatedSignup.courseID && updatedSignup.offerID) { //OFFER
            const offer = await getOffer(db, updatedSignup.offerID)
            if (offer != undefined){
                const result = await generateSignupInvoice(db, updatedSignup, undefined, offer)
                if (result) {
                    systemLog(systemAction.ADMsignupPayment, systemActionStatus.success, `Wystawiono fakturę #${result.invoiceNumber} do zapisu #${signup.id}`, validatedUser, db);
                }
            }
        } else { systemLog(systemAction.ADMsignupPayment, systemActionStatus.error, rm021011, validatedUser, db); return serviceUnavailable(rm021011) }
    }
    systemLog(systemAction.ADMsignupPayment, systemActionStatus.success, `Zarejestrowano płatność ${paymentAmount}PLN dla zapisu #${signup.id}`, validatedUser, db);
    return Response.json(null, {status: 200})
}