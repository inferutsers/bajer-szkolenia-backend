import getDatabase from "@/connection/database"
import sendSingleEmail from "@/functions/sendSingleEmail"
import courseElement from "@/interfaces/courseElement"
import mailStructure from "@/interfaces/mailStructure"
import signupElement from "@/interfaces/signupElement"
import { badRequest, serviceUnavailable, notFound, notAllowed, notAcceptable, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response){
    const headers = req.headers
    const courseID = headers.get("courseID")
    const sname = headers.get("sName")
    const ssurname = headers.get("sSurname")
    const semail = headers.get("sEmail")
    const sphonenumber = headers.get("sPhonenumber")
    const siscompany = headers.get("sIsCompany")
    if (!courseID || !sname || !ssurname || !semail || !sphonenumber || !siscompany) { return badRequest }
    const scompanyname = headers.get("sCompanyName")
    const scompanyadress = headers.get("sCompanyAdress")
    const scompanynip = headers.get("sCompanyNIP")
    if ((!scompanyname || !scompanyadress || !scompanynip) && siscompany == "true") { return badRequest }
    const db = await getDatabase()
    const currentDate = new Date()
    const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}+${currentDate.getTimezoneOffset()}`
    const courseFoundArray = await db.query("SELECT * FROM courses WHERE id = $1 AND date > $2 LIMIT 1", [courseID, currentDateFormatted])
    if (!courseFoundArray || courseFoundArray.rowCount == 0) { return notFound }
    const courseSignupsArray = await db.query('SELECT "id" from "signups" WHERE "courseID" = $1', [courseID])
    const courseSignupsAmount = courseSignupsArray.rowCount as Number
    const courseFound: courseElement = courseFoundArray.rows.map((result) => ({id: result.id, date: result.date, span: result.span, price: result.price, title: result.title, place: result.place, instructor: result.instructor, note: result.note, slots: result.slots, slotAvailable: (courseSignupsAmount < result.slots), available: result.available}))[0]
    if (!courseFound) { return serviceUnavailable }
    if (courseSignupsAmount >= courseFound.slots || courseFound.available == false){ return notAcceptable }
    const response = await db.query('INSERT INTO signups("id", "name", "surname", "email", "phoneNumber", "isCompany", "companyName", "companyAdress", "companyNIP", "date", "courseID", "supPrice") VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [sname, ssurname, semail, sphonenumber, siscompany, scompanyname, scompanyadress, scompanynip, currentDateFormatted, courseFound.id, courseFound.price])
    if (!response || response.rowCount == 0) { return badRequest }
    const returnedSignup: signupElement = response.rows.map((result) => ({id: result.id, name: result.name, surname: result.surname, email: result.email, phoneNumber: result.phoneNumber, isCompany: result.isCompany, companyName: result.companyName, companyAdress: result.companyAdress, companyNIP: result.companyNIP, date: result.date, courseID: result.courseID, supPrice: result.supPrice, emailsSent: result.emailsSent, paidIn: result.paidIn, invoices: result.invoices}))[0]
    const mailSent: mailStructure = await sendSingleEmail(returnedSignup.email, "Potwierdzenie zapisu", "text", "<b>HTML TEXT</b>")
    if(mailSent.failure == false) {
        await db.query('UPDATE signups SET "emailsSent" = ARRAY_APPEND("emailsSent", $1)  WHERE "id" = $2', [mailSent, returnedSignup.id])
        return NextResponse.json({id: response.rows[0].id}, {status: 200})
    } else {
        await db.query('DELETE FROM signups WHERE id = $1', [returnedSignup.id])
        return unprocessableContent
    }
}