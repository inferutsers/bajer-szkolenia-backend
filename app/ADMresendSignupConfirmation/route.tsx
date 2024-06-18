import getDatabase from "@/connection/database"
import sendSignupConfirmation from "@/functions/sendSignupConfirmation"
import validateSession from "@/functions/validateSession"
import courseElement from "@/interfaces/courseElement"
import signupElement from "@/interfaces/signupElement"
import { badRequest, gone, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signupArray = await db.query('SELECT * FROM "signups" WHERE "id" = $1 LIMIT 1', [signupID])
    if (!signupArray || signupArray.rowCount == 0) { return notFound }
    const signup: signupElement = signupArray.rows.map((result) => ({id: result.id, name: result.name, surname: result.surname, email: result.email, phoneNumber: result.phoneNumber, isCompany: result.isCompany, companyName: result.companyName, companyAdress: result.companyAdress, companyNIP: result.companyNIP, date: result.date, courseID: result.courseID, supPrice: result.supPrice, emailsSent: result.emailsSent, paidIn: result.paidIn}))[0]
    const courseArray = await db.query('SELECT * FROM "courses" WHERE "id" = $1 LIMIT 1', [signup.courseID])
    if (!courseArray || courseArray.rowCount == 0) { return gone }
    const course: courseElement = courseArray.rows.map((result) => ({id: result.id, date: result.date, span: result.span, price: result.price, title: result.title, place: result.place, instructor: result.instructor, note: result.note, slots: result.slots, available: result.available}))[0]
    const signupConfirmation = await sendSignupConfirmation(db, signup, course)
    if(signupConfirmation.mailSent == true) {
        return NextResponse.json(null, {status: 200})
    } else {
        return unprocessableContent
    }
}