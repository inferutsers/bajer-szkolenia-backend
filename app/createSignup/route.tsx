import getDatabase from "@/connection/database"
import { badRequest, notFound, notAcceptable, unprocessableContent, unauthorized } from "@/responses/responses"
import utf8 from "utf8"
import sendSignupConfirmation from "@/functions/emails/sendSignupConfirmation"
import { getCourse } from "@/functions/queries/course"
import { createSignup, deleteSignup, getCourseSignups, signupTechnicalBreak } from "@/functions/queries/signups"
import formatAttendees from "@/functions/formattings/attendeesFormatting"
import signupForNewsletter from "@/functions/signupForNewsletter"
import { rm001001, rm021012, rm021015, rm021017, rm021018, rm021019, rm021027 } from "@/responses/messages"
import { capitalizeAdress, capitalizeWords, formatCompanyName } from "@/functions/formattings/stringFormattings"
import { validateFormData } from "@/functions/dataValidator"

export async function POST(req: Request){
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
    sattendees = formatAttendees(utf8.decode(sname ?? ""), utf8.decode(ssurname ?? ""), siscompany === "true", headers.get("sAttendees"))
    if (!courseID || !sname || !ssurname || !semail || !sphonenumber || !siscompany || !sadress || !sattendees || !snewsletter) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validationError = validateFormData(siscompany, scompanynip, sphonenumber, utf8.decode(sadress), utf8.decode(sname), utf8.decode(ssurname), sattendees, semail)
    if (validationError) { return unprocessableContent(validationError) }
    const technicalBreak = await signupTechnicalBreak(db)
    if (technicalBreak) { return unauthorized(rm021027.replaceAll("$$$", technicalBreak)) }
    const course = await getCourse(db, courseID)
    if (!course || course.customURL != undefined) { return notFound(rm021015) }
    const courseSignupsAmount = (await getCourseSignups(db, courseID))?.length ?? 0
    if (courseSignupsAmount + sattendees.length > course.slots){ return notAcceptable(rm021017) }
    if (course.available == false) { return notAcceptable(rm021018) }
    const price = course.price * sattendees.length,
    adjustedPrice = price - (sattendees.length == 2 ? price * 0.05 : (sattendees.length > 2 ? price * 0.1 : 0)),
    signup = await createSignup(
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
        return Response.json({id: signup.id}, {status: 200})
    } else {
        await deleteSignup(db, signup.id)
        return unprocessableContent(rm021012)
    }
}