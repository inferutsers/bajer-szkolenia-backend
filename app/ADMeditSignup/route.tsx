import getDatabase from "@/connection/database"
import getCourseName from "@/functions/getCourseName"
import getInvoiceNumber from "@/functions/getInvoiceNumber"
import validateSession from "@/functions/validateSession"
import signupElement from "@/interfaces/signupElement"
import { badRequest, notFound, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"

export async function PATCH(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const signupID = headers.get("signupID")
    const suName = headers.get("suName")
    const suSurname = headers.get("suSurname")
    const suEmail = headers.get("suEmail")
    const suPhonenumber = headers.get("suPhonenumber")
    const suIscompany = headers.get("suIscompany")
    const suCompanyname = headers.get("suCompanyname")
    const suCompanyadress = headers.get("suCompanyadress")
    const suCompanyNIP = headers.get("suCompanyNIP")
    const suSupprice = headers.get("suSupprice")
    if (!sessionID || !signupID || !suName || !suSurname || !suEmail || !suPhonenumber || !suIscompany || !suSupprice) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signupArray = await db.query('SELECT * FROM "signups" WHERE "id" = $1 LIMIT 1', [signupID])
    if (!signupArray || signupArray.rowCount == 0) { return notFound }
    const returnedSignupArray = await db.query('UPDATE "signups" SET "name" = $1, "surname" = $2, "email" = $3, "phoneNumber" = $4, "isCompany" = $5, "companyName" = $6, "companyAdress" = $7, "companyNIP" = $8, "supPrice" = $9 WHERE "id" = $10 RETURNING *', [utf8.decode(suName), utf8.decode(suSurname), utf8.decode(suEmail), suPhonenumber, suIscompany, utf8.decode(suCompanyname as string), utf8.decode(suCompanyadress as string), suCompanyNIP, suSupprice, signupID])
    if (!returnedSignupArray || returnedSignupArray.rowCount == 0) { return badRequest }
    const returnedSignup: signupElement = (await Promise.all(returnedSignupArray.rows.map(async (result) => ({id: result.id, name: result.name, surname: result.surname, email: result.email, phoneNumber: result.phoneNumber, isCompany: result.isCompany, companyName: result.companyName, companyAdress: result.companyAdress, companyNIP: result.companyNIP, date: result.date, courseID: result.courseID, supPrice: result.supPrice, emailsSent: result.emailsSent, paidIn: result.paidIn, invoiceNumber: await getInvoiceNumber(db, result.id), courseName: await getCourseName(db, result.courseID)}))))[0]
    return NextResponse.json(returnedSignup, {status: 200})
}