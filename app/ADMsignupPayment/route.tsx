import getDatabase from "@/connection/database"
import generateSignupInvoice from "@/functions/invoices/generateSignupInvoice"
import { ADMgetCourse } from "@/functions/queries/course"
import { getOffer } from "@/functions/queries/offer"
import { addPaymentToSignup, formatAsSignupElement, getSignup } from "@/functions/queries/signups"
import validateSession from "@/functions/validateSession"
import { badRequest, notAcceptable, notFound, serviceUnavailable, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID"),
    paymentAmount = headers.get("paymentAmount")
    if (!sessionID || !signupID || !paymentAmount) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound }
    if ((signup.supPrice - signup.paidIn) < (Number(paymentAmount))) { return notAcceptable }
    const updatedSignup = await addPaymentToSignup(db, signupID, paymentAmount)
    if (!updatedSignup) { return unprocessableContent }
    if (updatedSignup.paidIn >= updatedSignup.supPrice) { 
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
        } else { return serviceUnavailable }
    }
    return NextResponse.json(null, {status: 200})
}