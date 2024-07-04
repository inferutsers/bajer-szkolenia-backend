import getDatabase from "@/connection/database"
import generateSignupInvoice from "@/functions/invoices/generateSignupInvoice"
import { ADMgetCourse } from "@/functions/queries/course"
import { formatAsSignupElement, getSignup } from "@/functions/queries/signups"
import validateSession from "@/functions/validateSession"
import signupElement from "@/interfaces/signupElement"
import { badRequest, notAcceptable, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID"),
    paymentAmount = headers.get("paymentAmount")
    if (!sessionID || !signupID || !paymentAmount) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound }
    if ((signup.supPrice - signup.paidIn) < (Number(paymentAmount))) { return notAcceptable }
    const editedSignupArray = await db.query('UPDATE "signups" SET "paidIn" = "paidIn" + $1 WHERE "id" = $2 AND "invalidated" = false RETURNING *', [paymentAmount, signupID])
    if (!editedSignupArray || editedSignupArray.rowCount == 0) { return unprocessableContent }
    const editedSignup: signupElement = await formatAsSignupElement(editedSignupArray.rows[0], db)
    if (editedSignup.paidIn >= editedSignup.supPrice) { 
        const course = await ADMgetCourse(db, editedSignup.courseID)
        if (course != undefined){
            await generateSignupInvoice(db, editedSignup, course)
        }
    }
    return NextResponse.json(null, {status: 200})
}