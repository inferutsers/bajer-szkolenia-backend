import getDatabase from "@/connection/database"
import { getCourse } from "@/functions/queries/course"
import { getSignup } from "@/functions/queries/signups"
import sendSignupConfirmation from "@/functions/emails/sendSignupConfirmation"
import validateSession from "@/functions/validateSession"
import { badRequest, gone, notFound, serviceUnavailable, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import { getOffer } from "@/functions/queries/offer"
import { rm001000, rm001001, rm021000, rm021008, rm021009, rm021011, rm021012 } from "@/responses/messages"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound(rm021000) }
    if (signup.courseID && !signup.offerID) { //COURSE
        const course = await getCourse(db, signup.courseID)
        if (!course) { return gone(rm021008) }
        const signupConfirmation = await sendSignupConfirmation(db, signup, course)
        if(signupConfirmation.mailSent == true) { return NextResponse.json(null, {status: 200}) }
    } else if (!signup.courseID && signup.offerID) { //OFFER
        const offer = await getOffer(db, signup.offerID)
        if (!offer) { return gone(rm021009) }
        const signupConfirmation = await sendSignupConfirmation(db, signup, undefined, offer)
        if(signupConfirmation.mailSent == true) { return NextResponse.json(null, {status: 200}) }
    } else { return serviceUnavailable(rm021011) }
    return unprocessableContent(rm021012)
}