import getDatabase from "@/connection/database";
import validateSession from "@/functions/validateSession";
import { badRequest, conflict, gone, notFound, serviceUnavailable, unauthorized } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";
import generateSignupInvoice from "@/functions/invoices/generateSignupInvoice";
import { getSignup } from "@/functions/queries/signups";
import { getSignupInvoiceCount } from "@/functions/queries/invoices";
import { ADMgetCourse } from "@/functions/queries/course";
import { getOffer } from "@/functions/queries/offer";
import { rm001000, rm001001, rm021000, rm021003, rm021008, rm021009, rm021011, rm021013 } from "@/responses/messages";

export async function POST(req: NextRequest, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound(rm021000) }
    const signupInvoicesCount = await getSignupInvoiceCount(db, signupID)
    if (signupInvoicesCount > 0) { return conflict(rm021003) }
    if (signup.isCompany && (!signup.companyNIP || !signup.companyName)) { return serviceUnavailable(rm021013) }
    if (signup.courseID && !signup.offerID){ //COURSE
        const course = await ADMgetCourse(db, signup.courseID)
        if (!course) { return gone(rm021008) }
        const result = await generateSignupInvoice(db, signup, course)
        return NextResponse.json(result, {status: 200})
    } else if (!signup.courseID && signup.offerID) { //OFFER
        const offer = await getOffer(db, signup.offerID)
        if (!offer) { return gone(rm021009) }
        const result = await generateSignupInvoice(db, signup, undefined, offer)
        return NextResponse.json(result, {status: 200})
    } else { return serviceUnavailable(rm021011) }
}
