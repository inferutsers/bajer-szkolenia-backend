import getDatabase from "@/connection/database"
import formatAttendees from "@/functions/attendeesFormatting"
import { ADMgetCourse } from "@/functions/queries/course"
import { getSignupInvoiceCount } from "@/functions/queries/invoices"
import { getSignup, updateSignup } from "@/functions/queries/signups"
import validateSession from "@/functions/validateSession"
import { badRequest, gone, notAcceptable, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"

export async function PATCH(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID"),
    suName = headers.get("suName"),
    suSurname = headers.get("suSurname"),
    suEmail = headers.get("suEmail"),
    suPhonenumber = headers.get("suPhonenumber"),
    suIscompany = headers.get("suIscompany"),
    suCompanyname = headers.get("suCompanyname"),
    suAdress = headers.get("suAdress"),
    suCompanyNIP = headers.get("suCompanyNIP"),
    suSupprice = headers.get("suSupprice"),
    suPesel = headers.get("suPesel"),
    suAttendees = formatAttendees(suName, suSurname, suIscompany === "true", headers.get("suAttendees"))
    if (!sessionID || !signupID || !suName || !suSurname || !suEmail || !suPhonenumber || !suIscompany || !suSupprice || !suAdress || !suAttendees) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound }
    const signupInvoiceCount = await getSignupInvoiceCount(db, signupID)
    if (signupInvoiceCount > 0) { return unprocessableContent }
    if (signup.attendees.length < suAttendees.length){
        const course = await ADMgetCourse(db, signup.courseID)
        if (!course) { return gone }
        if (course.slotsUsed - signup.attendees.length + suAttendees.length > course.slots) { return notAcceptable }
    }
    const changedSignup = await updateSignup(db, signupID, utf8.decode(suName), utf8.decode(suSurname), utf8.decode(suEmail), suPhonenumber, utf8.decode(suAdress), suPesel ? suPesel : undefined, suIscompany, suCompanyname ? utf8.decode(suCompanyname): undefined, suCompanyNIP ? suCompanyNIP : undefined, suSupprice, suAttendees)
    if (!changedSignup) { return badRequest }
    return NextResponse.json(changedSignup, {status: 200})
}