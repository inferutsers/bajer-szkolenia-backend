import getDatabase from "@/connection/database"
import { badRequest, notFound, notAcceptable, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"
import sendSignupConfirmation from "@/functions/emails/sendSignupConfirmation"
import { getCourse } from "@/functions/queries/course"
import getCourseSignupCount from "@/functions/getCourseSignupCount"
import { createSignup, deleteSignup } from "@/functions/queries/signups"

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
    spesel = headers.get("sPesel")
    if (!courseID || !sname || !ssurname || !semail || !sphonenumber || !siscompany || !sadress) { return badRequest }
    if (siscompany == 'true' && scompanynip!.length != 10) { return unprocessableContent }
    const db = await getDatabase(req)
    const course = await getCourse(db, courseID)
    if (!course || course.customURL != undefined) { return notFound }
    const courseSignupsAmount = await getCourseSignupCount(db, courseID)
    if (courseSignupsAmount >= course.slots || course.available == false){ return notAcceptable }
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
        courseID,
        course.price
    )
    if (!signup) { return unprocessableContent }
    const signupConfirmation = await sendSignupConfirmation(db, signup, course)
    if(signupConfirmation.mailSent == true) {
        return NextResponse.json({id: signup.id}, {status: 200})
    } else {
        await deleteSignup(db, signup.id)
        return unprocessableContent
    }
}