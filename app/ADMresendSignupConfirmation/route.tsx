import getDatabase from "@/connection/database"
import { getCourse } from "@/functions/queries/course"
import { getSignup } from "@/functions/queries/signups"
import sendSignupConfirmation from "@/functions/emails/sendSignupConfirmation"
import validateSession from "@/functions/validateSession"
import { badRequest, gone, notFound, serviceUnavailable, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import { getOffer } from "@/functions/queries/offer"
import { rm001000, rm001001, rm021000, rm021008, rm021009, rm021011, rm021012 } from "@/responses/messages"
import { systemLog } from "@/functions/logging/log"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID)
    if (!signup) { systemLog(systemAction.ADMresendSignupConfirmation, systemActionStatus.error, rm021000, validatedUser, db); return notFound(rm021000) }
    if (signup.permissionRequired > validatedUser.status) { systemLog(systemAction.ADMresendSignupConfirmation, systemActionStatus.error, rm001000, validatedUser, db); return unauthorized(rm001000) }
    if (signup.courseID && !signup.offerID) { //COURSE
        const course = await getCourse(db, signup.courseID)
        if (!course) { systemLog(systemAction.ADMresendSignupConfirmation, systemActionStatus.error, rm021008, validatedUser, db); return gone(rm021008) }
        const signupConfirmation = await sendSignupConfirmation(db, signup, course)
        if(signupConfirmation.mailSent == true) { systemLog(systemAction.ADMresendSignupConfirmation, systemActionStatus.success, `Wysłano ponowne potwierdzenie dla zapisu #${signup.id}`, validatedUser, db); return NextResponse.json(null, {status: 200}) }
    } else if (!signup.courseID && signup.offerID) { //OFFER
        const offer = await getOffer(db, signup.offerID)
        if (!offer) { systemLog(systemAction.ADMresendSignupConfirmation, systemActionStatus.error, rm021009, validatedUser, db); return gone(rm021009) }
        const signupConfirmation = await sendSignupConfirmation(db, signup, undefined, offer)
        if(signupConfirmation.mailSent == true) { systemLog(systemAction.ADMresendSignupConfirmation, systemActionStatus.success, `Wysłano ponowne potwierdzenie dla zapisu #${signup.id}`, validatedUser, db); return NextResponse.json(null, {status: 200}) }
    } else { systemLog(systemAction.ADMresendSignupConfirmation, systemActionStatus.error, rm021011, validatedUser, db); return serviceUnavailable(rm021011) }
    systemLog(systemAction.ADMresendSignupConfirmation, systemActionStatus.error, rm021012, validatedUser, db);
    return unprocessableContent(rm021012)
}