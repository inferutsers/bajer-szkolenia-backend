import getDatabase from "@/connection/database"
import { getCourse } from "@/functions/queries/course"
import { getSignup } from "@/functions/queries/signups"
import sendSignupConfirmation from "@/functions/sendSignupConfirmation"
import validateSession from "@/functions/validateSession"
import { badRequest, gone, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"

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
    const course = await getCourse(db, signup.courseID)
    if (!course) { return gone}
    const signupConfirmation = await sendSignupConfirmation(db, signup, course)
    if(signupConfirmation.mailSent == true) {
        return NextResponse.json(null, {status: 200})
    } else {
        return unprocessableContent
    }
}