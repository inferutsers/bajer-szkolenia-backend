import getDatabase from "@/connection/database"
import signupElement from "@/interfaces/signupElement"
import { badRequest, notFound, notAcceptable, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"
import sendSignupConfirmation from "@/functions/emails/sendSignupConfirmation"
import { getCourse } from "@/functions/queries/course"
import getCourseSignupCount from "@/functions/getCourseSignupCount"
import { getDateLong } from "@/functions/dates"
import { formatAsSignupElement } from "@/functions/queries/signups"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    courseID = headers.get("courseID"),
    sname = headers.get("sName"),
    ssurname = headers.get("sSurname"),
    semail = headers.get("sEmail"),
    sphonenumber = headers.get("sPhonenumber"),
    siscompany = headers.get("sIsCompany"),
    scompanyname = headers.get("sCompanyName"),
    scompanyadress = headers.get("sCompanyAdress"),
    scompanynip = headers.get("sCompanyNIP")
    if (!courseID || !sname || !ssurname || !semail || !sphonenumber || !siscompany ) { return badRequest }
    const db = await getDatabase(req)
    const course = await getCourse(db, courseID)
    if (!course) { return notFound }
    const courseSignupsAmount = await getCourseSignupCount(db, courseID)
    if (courseSignupsAmount >= course.slots || course.available == false){ return notAcceptable }
    const response = await db.query('INSERT INTO signups("id", "name", "surname", "email", "phoneNumber", "isCompany", "companyName", "companyAdress", "companyNIP", "date", "courseID", "supPrice") VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [utf8.decode(sname), utf8.decode(ssurname), utf8.decode(semail), sphonenumber, siscompany, utf8.decode(scompanyname as string), utf8.decode(scompanyadress as string), scompanynip, getDateLong(), course.id, course.price])
    if (!response || response.rowCount == 0) { return badRequest }
    const returnedSignup: signupElement = await formatAsSignupElement(response.rows[0], db)
    const signupConfirmation = await sendSignupConfirmation(db, returnedSignup, course)
    if(signupConfirmation.mailSent == true) {
        return NextResponse.json({id: returnedSignup.id}, {status: 200})
    } else {
        await db.query('DELETE FROM signups WHERE id = $1', [returnedSignup.id])
        return unprocessableContent
    }
}