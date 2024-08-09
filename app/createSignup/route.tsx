import getDatabase from "@/connection/database"
import { badRequest, notFound, notAcceptable, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"
import sendSignupConfirmation from "@/functions/emails/sendSignupConfirmation"
import { getCourse } from "@/functions/queries/course"
import { createSignup, deleteSignup } from "@/functions/queries/signups"
import formatAttendees from "@/functions/attendeesFormatting"
import signupForNewsletter from "@/functions/signupForNewsletter"
import { getOffer } from "@/functions/queries/offer"
import { getCourseSignupsCount } from "@/functions/getCourseSignups"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    offerID = headers.get("offerID"),
    courseID = headers.get("courseID"),
    sname = headers.get("sName"),
    ssurname = headers.get("sSurname"),
    semail = headers.get("sEmail"),
    sphonenumber = headers.get("sPhonenumber"),
    siscompany = headers.get("sIsCompany"),
    scompanyname = headers.get("sCompanyName"),
    sadress = headers.get("sAdress"),
    scompanynip = headers.get("sCompanyNIP"),
    spesel = headers.get("sPesel"),
    snewsletter = headers.get("sNewsletter"),
    sattendees = formatAttendees(sname, ssurname, siscompany === "true", headers.get("sAttendees"))
    if ((!courseID && !offerID) || !sname || !ssurname || !semail || !sphonenumber || !siscompany || !sadress || !sattendees || !snewsletter) { return badRequest }
    if (siscompany == 'true' && scompanynip!.length != 10) { return unprocessableContent }
    const db = await getDatabase(req)
    if ((!offerID || offerID == "") && courseID && courseID != ""){ //COURSE
        const course = await getCourse(db, courseID)
        if (!course || course.customURL != undefined) { return notFound }
        const courseSignupsAmount = await getCourseSignupsCount(db, courseID)
        if (courseSignupsAmount + sattendees.length > course.slots || course.available == false){ return notAcceptable }
        const signup = await createSignup(
            db, 
            utf8.decode(sname), 
            utf8.decode(ssurname),
            semail,
            sphonenumber,
            utf8.decode(sadress),
            (spesel ? spesel : undefined),
            siscompany,
            (siscompany == 'true' ? utf8.decode(scompanyname!) : undefined),
            (siscompany == 'true' ? scompanynip! : undefined),
            courseID == "" ? undefined : courseID,
            undefined,
            course.price * sattendees.length,
            sattendees
        )
        if (!signup) { return unprocessableContent }
        const signupConfirmation = await sendSignupConfirmation(db, signup, course)
        if(signupConfirmation.mailSent == true) {
            if (snewsletter === "true"){
                await signupForNewsletter(db, semail)
            }
            return NextResponse.json({id: signup.id}, {status: 200})
        } else {
            await deleteSignup(db, signup.id)
            return unprocessableContent
        }
    } else if (offerID && offerID != "" && (!courseID || courseID == "")){ //OFFER
        const offer = await getOffer(db, offerID)
        if (!offer || !offer.courses) { return notFound }
        var courseFull: boolean = false
        offer.courses!.forEach(async course => {
            const courseSignupsAmount = await getCourseSignupsCount(db, course.id)
            if (courseSignupsAmount + sattendees.length > course.slots || course.available == false){ courseFull = true }
        });
        if (courseFull) { return notAcceptable }
        const signup = await createSignup(
            db, 
            utf8.decode(sname), 
            utf8.decode(ssurname),
            semail,
            sphonenumber,
            utf8.decode(sadress),
            (spesel ? spesel : undefined),
            siscompany,
            (siscompany == 'true' ? utf8.decode(scompanyname!) : undefined),
            (siscompany == 'true' ? scompanynip! : undefined),
            undefined,
            offerID == "" ? undefined : offerID,
            offer.price * sattendees.length,
            sattendees
        )
        if (!signup) { return unprocessableContent }
        const signupConfirmation = await sendSignupConfirmation(db, signup, undefined, offer)
        if(signupConfirmation.mailSent == true) {
            if (snewsletter === "true"){
                await signupForNewsletter(db, semail)
            }
            return NextResponse.json({id: signup.id}, {status: 200})
        } else {
            await deleteSignup(db, signup.id)
            return unprocessableContent
        }
    } else { return badRequest }
}