import getDatabase from "@/connection/database"
import generateSignupInvoice from "@/functions/invoices/generateSignupInvoice"
import { ADMgetCourse } from "@/functions/queries/course"
import { getSignupInvoiceCount } from "@/functions/queries/invoices"
import { getOffer } from "@/functions/queries/offer"
import { addPaymentToSignup, getSignup } from "@/functions/queries/signups"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm021000, rm021006, rm021011, rm021014 } from "@/responses/messages"
import { badRequest, notAcceptable, notFound, serviceUnavailable, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID"),
    paymentAmount = headers.get("paymentAmount")
    if (!sessionID || !signupID || !paymentAmount) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound(rm021000) }
    if ((signup.supPrice - signup.paidIn) < (Number(paymentAmount))) { return notAcceptable(rm021014) }
    const updatedSignup = await addPaymentToSignup(db, signupID, paymentAmount)
    if (!updatedSignup) { return unprocessableContent(rm021006) }
    if (updatedSignup.paidIn >= updatedSignup.supPrice && (await getSignupInvoiceCount(db, updatedSignup.id)) == 0) { 
        if (updatedSignup.courseID && !updatedSignup.offerID) { //COURSE
            const course = await ADMgetCourse(db, updatedSignup.courseID)
            if (course != undefined){
                await generateSignupInvoice(db, updatedSignup, course)
            }
        } else if (!updatedSignup.courseID && updatedSignup.offerID) { //OFFER
            const offer = await getOffer(db, updatedSignup.offerID)
            if (offer != undefined){
                await generateSignupInvoice(db, updatedSignup, undefined, offer)
            }
        } else { return serviceUnavailable(rm021011) }
    }
    return NextResponse.json(null, {status: 200})
}