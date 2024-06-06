'use server'

import getDatabase from "@/connection/database"
import sendSignupConfirmation from "@/functions/sendSignupConfirmation"
import courseElement from "@/interfaces/courseElement"
import signupElement from "@/interfaces/signupElement"
import { badRequest, serviceUnavailable, notFound, notAllowed, notAcceptable } from "@/responses/responses"
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
    const courseFoundArray = await db.query("SELECT * FROM courses WHERE id = $1 LIMIT 1", [courseID])
    if (!courseFoundArray || courseFoundArray.rowCount == 0) { return notFound }
    const courseFound: courseElement = courseFoundArray.rows.map((result) => ({id: result.id, date: result.date, span: result.span, price: result.price, title: result.title, place: result.place, instructor: result.instructor, note: result.note, slots: result.slots}))[0]
    if (!courseFound) { return serviceUnavailable }
    const courseSignupsArray = await db.query('SELECT "id" from "signups" WHERE "courseID" = $1', [courseFound.id])
    const courseSignupsAmount = courseSignupsArray.rowCount as Number
    if (courseSignupsAmount >= courseFound.slots){ return notAcceptable }
    const currentDate = new Date()
    const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}+${currentDate.getTimezoneOffset()}`
    const response = await db.query('INSERT INTO signups("id", "name", "surname", "email", "phoneNumber", "isCompany", "companyName", "companyAdress", "companyNIP", "date", "courseID", "supPrice") VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [sname, ssurname, semail, sphonenumber, siscompany, scompanyname, scompanyadress, scompanynip, currentDateFormatted, courseFound.id, courseFound.price])
    if (!response || response.rowCount == 0) { return badRequest }
    const returnedSignup: signupElement = response.rows.map((result) => ({id: result.id, name: result.name, surname: result.surname, email: result.email, phoneNumber: result.phoneNumber, isCompany: result.isCompany, companyName: result.companyName, companyAdress: result.companyAdress, companyNIP: result.companyNIP, date: result.date, courseID: result.courseID, supPrice: result.supPrice, confirmationSent: result.confirmationSent}))[0]
    const mailSent: Boolean = await sendSignupConfirmation(returnedSignup)
    if(mailSent == true) {
        await db.query('UPDATE signups SET "confirmationSent" = true WHERE "id" = $1', [returnedSignup.id])
    }
    return NextResponse.json({id: response.rows[0].id, mailSent: mailSent}, {status: 200})
}