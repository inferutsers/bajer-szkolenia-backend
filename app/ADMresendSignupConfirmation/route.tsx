import getDatabase from "@/connection/database"
import { getCourse } from "@/functions/queries/course"
import { getSignup } from "@/functions/queries/signups"
import sendSignupConfirmation from "@/functions/emails/sendSignupConfirmation"
import validateSession from "@/functions/validateSession"
import { badRequest, gone, notFound, serviceUnavailable, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import { getOffer } from "@/functions/queries/offer"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound }
    if (signup.courseID && !signup.offerID) { //COURSE
        const course = await getCourse(db, signup.courseID)
        if (!course) { return gone }
        const signupConfirmation = await sendSignupConfirmation(db, signup, course)
        if(signupConfirmation.mailSent == true) { return NextResponse.json(null, {status: 200}) }
    } else if (!signup.courseID && signup.offerID) { //OFFER
        const offer = await getOffer(db, signup.offerID)
        if (!offer) { return gone }
        const signupConfirmation = await sendSignupConfirmation(db, signup, undefined, offer)
        if(signupConfirmation.mailSent == true) { return NextResponse.json(null, {status: 200}) }
    } else { return serviceUnavailable }
    return unprocessableContent
}