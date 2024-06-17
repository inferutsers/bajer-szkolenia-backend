import getDatabase from "@/connection/database"
import validateSession from "@/functions/validateSession"
import signupElement from "@/interfaces/signupElement"
import { badRequest, noContent, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"
import getCourseName from "@/functions/getCourseName"
import getInvoiceNumber from "@/functions/getInvoiceNumber"

export async function GET(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const courseID = headers.get("courseID")
    const signupsArray = !courseID ? (await db.query('SELECT * FROM "signups" ORDER BY "date" DESC')) : (await db.query('SELECT * FROM "signups" WHERE "courseID" = $1 ORDER BY "date" DESC', [courseID]))
    if (!signupsArray || signupsArray.rowCount == 0) { return noContent }
    const signups: signupElement[] = await Promise.all(signupsArray.rows.map(async (result) => ({id: result.id, name: result.name, surname: result.surname, email: result.email, phoneNumber: result.phoneNumber, isCompany: result.isCompany, companyName: result.companyName, companyAdress: result.companyAdress, companyNIP: result.companyNIP, date: result.date, courseID: result.courseID, supPrice: result.supPrice, emailsSent: result.emailsSent, paidIn: result.paidIn, invoiceNumber: await getInvoiceNumber(db, result.id), courseName: await getCourseName(db, result.courseID)})))
    return NextResponse.json(signups, {status: 200})
}