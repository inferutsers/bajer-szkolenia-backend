import getDatabase from "@/connection/database"
import { badRequest, notFound, notAcceptable, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"
import sendSignupConfirmation from "@/functions/emails/sendSignupConfirmation"
import { getCourse } from "@/functions/queries/course"
import { createSignup, deleteSignup, getCourseSignups } from "@/functions/queries/signups"
import formatAttendees from "@/functions/attendeesFormatting"
import signupForNewsletter from "@/functions/signupForNewsletter"
import { rm001001, rm021012, rm021013, rm021015, rm021017, rm021018, rm021019, rm021020, rm021022, rm021023, rm021024, rm021025, rm021026 } from "@/responses/messages"
import { capitalizeAdress, capitalizeWords, formatCompanyName } from "@/functions/stringFormattings"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
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
    if (!courseID || !sname || !ssurname || !semail || !sphonenumber || !siscompany || !sadress || !sattendees || !snewsletter) { return badRequest(rm001001) }
    if (siscompany == 'true' && scompanynip!.length != 10) { return unprocessableContent(rm021013) }
    if (!/^\d{9}$/.test(sphonenumber)) { return unprocessableContent(rm021022) }
    if (!/^\d{2}-\d{3}$/.test(sadress.split("|=|")[1])) { return unprocessableContent(rm021023) }
    if (!/^[a-zA-Z]+$/.test(sname) || !/^[a-zA-Z-]+$/.test(ssurname)) { return unprocessableContent(rm021024) }
    if (sattendees.map(attendee => { return /^[a-zA-Z]+ [a-zA-Z-]+$/.test(attendee) }).includes(false)) { return unprocessableContent(rm021025) }
    if (!/^[a-zA-Z0-9!#$%&'*+-/=?^_\{|}~]+@[a-zA-Z0-9-.]+$/.test(semail)) { return unprocessableContent(rm021026) }
    const db = await getDatabase(req)
    const course = await getCourse(db, courseID)
    if (!course || course.customURL != undefined) { return notFound(rm021015) }
    const courseSignupsAmount = (await getCourseSignups(db, courseID))?.length
    if ((courseSignupsAmount ? courseSignupsAmount : 0) + sattendees.length > course.slots){ return notAcceptable(rm021017) }
    if (course.available == false) { return notAcceptable(rm021018) }
    const price = course.price * sattendees.length
    const adjustedPrice = price - (sattendees.length == 2 ? price * 0.05 : (sattendees.length > 2 ? price * 0.1 : 0))
    const signup = await createSignup(
        db, 
        capitalizeWords(utf8.decode(sname)), 
        capitalizeWords(utf8.decode(ssurname)),
        semail.toLowerCase(),
        sphonenumber,
        capitalizeAdress(utf8.decode(sadress)),
        (spesel ? spesel : undefined),
        siscompany,
        (siscompany == 'true' ? formatCompanyName(utf8.decode(scompanyname!)) : undefined),
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
}