import getDatabase from "@/connection/database";
import validateSession from "@/functions/validateSession";
import { badRequest, conflict, gone, notFound, serviceUnavailable, unauthorized } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";
import generateSignupInvoice from "@/functions/generateSignupInvoice";
import { getSignup } from "@/functions/queries/signups";
import { getSignupInvoiceCount } from "@/functions/queries/invoices";
import { ADMgetCourse } from "@/functions/queries/course";

export async function POST(req: NextRequest, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound }
    const signupInvoicesCount = await getSignupInvoiceCount(db, signupID)
    if (signupInvoicesCount > 0) { return conflict }
    if (signup.isCompany && (!signup.companyAdress || !signup.companyNIP || !signup.companyName)) { return serviceUnavailable }
    const course = await ADMgetCourse(db, signup.courseID)
    if (!course) { return gone }
    const result = await generateSignupInvoice(db, signup, course)
    return NextResponse.json(result, {status: 200})
}
