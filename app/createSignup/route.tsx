import getDatabase from "@/connection/database"
import courseElement from "@/interfaces/courseElement"
import signupElement from "@/interfaces/signupElement"
import { badRequest, serviceUnavailable, notFound, notAcceptable, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"
import sendSignupConfirmation from "@/functions/sendSignupConfirmation"

export async function POST(req: Request, res: Response){
    const headers = req.headers
    const courseID = headers.get("courseID")
    const sname = headers.get("sName")
    const ssurname = headers.get("sSurname")
    const semail = headers.get("sEmail")
    const sphonenumber = headers.get("sPhonenumber")
    const siscompany = headers.get("sIsCompany")
    const scompanyname = headers.get("sCompanyName")
    const scompanyadress = headers.get("sCompanyAdress")
    const scompanynip = headers.get("sCompanyNIP")
    if (!courseID || !sname || !ssurname || !semail || !sphonenumber || !siscompany || !scompanyname || !scompanyadress || !scompanynip ) { return badRequest }
    const db = await getDatabase(req)
    const currentDate = new Date()
    const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}+${currentDate.getTimezoneOffset()}`
    const courseFoundArray = await db.query("SELECT * FROM courses WHERE id = $1 AND date > $2 LIMIT 1", [courseID, currentDateFormatted])
    if (!courseFoundArray || courseFoundArray.rowCount == 0) { return notFound }
    const courseSignupsArray = await db.query('SELECT "id" from "signups" WHERE "courseID" = $1', [courseID])
    const courseSignupsAmount = courseSignupsArray.rowCount as Number
    const courseFound: courseElement = courseFoundArray.rows.map((result) => ({id: result.id, date: result.date, span: result.span, price: result.price, title: result.title, place: result.place, instructor: result.instructor, note: result.note, slots: result.slots, slotAvailable: (courseSignupsAmount < result.slots), available: result.available}))[0]
    if (!courseFound) { return serviceUnavailable }
    if ((courseSignupsAmount as number) >= courseFound.slots || courseFound.available == false){ return notAcceptable }
    const response = await db.query('INSERT INTO signups("id", "name", "surname", "email", "phoneNumber", "isCompany", "companyName", "companyAdress", "companyNIP", "date", "courseID", "supPrice") VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [utf8.decode(sname), utf8.decode(ssurname), utf8.decode(semail), sphonenumber, siscompany, utf8.decode(scompanyname), utf8.decode(scompanyadress), scompanynip, currentDateFormatted, courseFound.id, courseFound.price])
    if (!response || response.rowCount == 0) { return badRequest }
    const returnedSignup: signupElement = response.rows.map((result) => ({id: result.id, name: result.name, surname: result.surname, email: result.email, phoneNumber: result.phoneNumber, isCompany: result.isCompany, companyName: result.companyName, companyAdress: result.companyAdress, companyNIP: result.companyNIP, date: result.date, courseID: result.courseID, supPrice: result.supPrice, emailsSent: result.emailsSent, paidIn: result.paidIn}))[0]
    const signupConfirmation = await sendSignupConfirmation(db, returnedSignup, courseFound)
    if(signupConfirmation.mailSent == true) {
        return NextResponse.json({id: returnedSignup.id}, {status: 200})
    } else {
        await db.query('DELETE FROM signups WHERE id = $1', [returnedSignup.id])
        return unprocessableContent
    }
}