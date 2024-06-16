import getDatabase from "@/connection/database"
import sendSingleEmail from "@/functions/sendSingleEmail"
import courseElement from "@/interfaces/courseElement"
import mailStructure from "@/interfaces/mailStructure"
import signupElement from "@/interfaces/signupElement"
import { badRequest, serviceUnavailable, notFound, notAcceptable, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import fs from "fs"

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
    const db = await getDatabase(req)
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
    const mailContentHTML = fs.readFileSync("/home/ubuntu/backend/templates/signupConfirmation.html", 'utf-8').replaceAll("{name}", returnedSignup.name as string).replaceAll("{surname}", returnedSignup.surname as string).replaceAll("{coursename}", courseFound.title as string).replaceAll("{coursedate}", "TBD").replaceAll("{coursetime}", "TBD").replaceAll("{courseinstructor}", courseFound.instructor as string).replaceAll("{courseplace}", courseFound.place as string).replaceAll("{coursenote}", courseFound.note as string).replaceAll("{signupphonenumber}", returnedSignup.phoneNumber as string).replaceAll("{signupemail}", returnedSignup.email as string).replaceAll("{signupcompanyname}", returnedSignup.companyName as string).replaceAll("{signupcompanyadress}", returnedSignup.companyAdress as string).replaceAll("{signupcompanynip}", returnedSignup.companyNIP as string).replaceAll("{paymentaccountnumber}", "TBD").replaceAll("{paymentreceiver}", "TBD").replaceAll("{paymenttitle}", `${returnedSignup.id}${returnedSignup.name}${returnedSignup.surname}`).replaceAll("{paymentamount}", String(returnedSignup.supPrice as number - (returnedSignup.paidIn as number)))
    const mailContentRaw = fs.readFileSync("/home/ubuntu/backend/templates/signupConfirmation.txt", 'utf-8').replaceAll("{name}", returnedSignup.name as string).replaceAll("{surname}", returnedSignup.surname as string).replaceAll("{coursename}", courseFound.title as string).replaceAll("{coursedate}", "TBD").replaceAll("{coursetime}", "TBD").replaceAll("{courseinstructor}", courseFound.instructor as string).replaceAll("{courseplace}", courseFound.place as string).replaceAll("{coursenote}", courseFound.note as string).replaceAll("{signupphonenumber}", returnedSignup.phoneNumber as string).replaceAll("{signupemail}", returnedSignup.email as string).replaceAll("{signupcompanyname}", returnedSignup.companyName as string).replaceAll("{signupcompanyadress}", returnedSignup.companyAdress as string).replaceAll("{signupcompanynip}", returnedSignup.companyNIP as string).replaceAll("{paymentaccountnumber}", "TBD").replaceAll("{paymentreceiver}", "TBD").replaceAll("{paymenttitle}", `${returnedSignup.id}${returnedSignup.name}${returnedSignup.surname}`).replaceAll("{paymentamount}", String(returnedSignup.supPrice as number - (returnedSignup.paidIn as number)))
    const mailSent: mailStructure = await sendSingleEmail(returnedSignup.email, "Potwierdzenie zapisu", mailContentRaw, mailContentHTML)
    if(mailSent.failure == false) {
        await db.query('UPDATE signups SET "emailsSent" = ARRAY_APPEND("emailsSent", $1)  WHERE "id" = $2', [mailSent, returnedSignup.id])
        return NextResponse.json({id: response.rows[0].id}, {status: 200})
    } else {
        await db.query('DELETE FROM signups WHERE id = $1', [returnedSignup.id])
        return unprocessableContent
    }
}