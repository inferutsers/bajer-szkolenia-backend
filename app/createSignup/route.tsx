import getDatabase from "@/connection/database"
import { badRequest, notFound, notAcceptable, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"
import sendSignupConfirmation from "@/functions/emails/sendSignupConfirmation"
import { getCourse } from "@/functions/queries/course"
import { createSignup, deleteSignup, getCourseSignups } from "@/functions/queries/signups"
import formatAttendees from "@/functions/attendeesFormatting"
import signupForNewsletter from "@/functions/signupForNewsletter"
import { getOffer } from "@/functions/queries/offer"
import { rm001001, rm021011, rm021012, rm021013, rm021015, rm021016, rm021017, rm021018, rm021019, rm021020 } from "@/responses/messages"
import { capitalizeAdress, capitalizeWords } from "@/functions/capitalizeStrings"

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
    sattendees = formatAttendees(utf8.decode(sname ? sname : ""), utf8.decode(ssurname ? ssurname : ""), siscompany === "true", headers.get("sAttendees"))
    if ((!courseID && !offerID) || !sname || !ssurname || !semail || !sphonenumber || !siscompany || !sadress || !sattendees || !snewsletter) { return badRequest(rm001001) }
    if (siscompany == 'true' && scompanynip!.length != 10) { return unprocessableContent(rm021013) }
    const db = await getDatabase(req)
    if ((!offerID || offerID == "") && courseID && courseID != ""){ //COURSE
        const course = await getCourse(db, courseID)
        if (!course || course.customURL != undefined) { return notFound(rm021015) }
        const courseSignupsAmount = await getCourseSignups(db, courseID)
        if (courseSignupsAmount ? courseSignupsAmount : 0 + sattendees.length > course.slots){ return notAcceptable(rm021017) }
        if (course.available == false) { return notAcceptable(rm021018) }
        const price = course.price * sattendees.length
        const adjustedPrice = price - (sattendees.length == 2 ? price * 0.05 : (sattendees.length > 2 ? price * 0.1 : 0))
        const signup = await createSignup(
            db, 
            capitalizeWords(utf8.decode(sname)), 
            capitalizeWords(utf8.decode(ssurname)),
            semail,
            sphonenumber.replaceAll(" ", ""),
            capitalizeAdress(utf8.decode(sadress)),
            (spesel ? spesel : undefined),
            siscompany,
            (siscompany == 'true' ? capitalizeWords(utf8.decode(scompanyname!)) : undefined),
            (siscompany == 'true' ? scompanynip! : undefined),
            courseID == "" ? undefined : courseID,
            undefined,
            Math.round(adjustedPrice),
            sattendees.map((attendee) => (capitalizeWords(attendee))),
            course.permissionRequired
        )
        if (!signup) { return unprocessableContent(rm021019) }
        const signupConfirmation = await sendSignupConfirmation(db, signup, course)
        if(signupConfirmation.mailSent == true) {
            if (snewsletter === "true"){
                await signupForNewsletter(db, semail)
            }
            return NextResponse.json({id: signup.id}, {status: 200})
        } else {
            await deleteSignup(db, signup.id)
            return unprocessableContent(rm021012)
        }
    } else if (offerID && offerID != "" && (!courseID || courseID == "")){ //OFFER
        const offer = await getOffer(db, offerID)
        if (!offer || !offer.courses) { return notFound(rm021016) }
        const coursesState = await Promise.all(offer.courses!.map(async course => {
            const courseSignupsAmount = await getCourseSignups(db, course.id)
            if (courseSignupsAmount ? courseSignupsAmount : 0 + sattendees.length > course.slots || course.available == false){ return false; }
            return true
        }));
        if (coursesState.includes(false)) { return notAcceptable(rm021020) }
        const signup = await createSignup(
            db, 
            capitalizeWords(utf8.decode(sname)), 
            capitalizeWords(utf8.decode(ssurname)),
            semail,
            sphonenumber.replaceAll(" ", ""),
            capitalizeAdress(utf8.decode(sadress)),
            (spesel ? spesel : undefined),
            siscompany,
            (siscompany == 'true' ? capitalizeWords(utf8.decode(scompanyname!)) : undefined),
            (siscompany == 'true' ? scompanynip! : undefined),
            undefined,
            offerID == "" ? undefined : offerID,
            offer.price * sattendees.length,
            sattendees.map((attendee) => (capitalizeWords(attendee))),
            1
        )
        if (!signup) { return unprocessableContent(rm021019) }
        const signupConfirmation = await sendSignupConfirmation(db, signup, undefined, offer)
        if(signupConfirmation.mailSent == true) {
            if (snewsletter === "true"){
                await signupForNewsletter(db, semail)
            }
            return NextResponse.json({id: signup.id}, {status: 200})
        } else {
            await deleteSignup(db, signup.id)
            return unprocessableContent(rm021012)
        }
    } else { return badRequest(rm021011) }
}