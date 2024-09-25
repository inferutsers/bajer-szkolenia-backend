import getDatabase from "@/connection/database"
import formatAttendees from "@/functions/attendeesFormatting"
import { ADMgetCourse } from "@/functions/queries/course"
import { getSignupInvoiceCount } from "@/functions/queries/invoices"
import { getOffer } from "@/functions/queries/offer"
import { getSignup, updateSignup } from "@/functions/queries/signups"
import validateSession from "@/functions/validateSession"
import ADMcourseElement from "@/interfaces/ADMcourseElement"
import { rm001000, rm001001, rm021000, rm021005, rm021006, rm021008, rm021009, rm021010, rm021011 } from "@/responses/messages"
import { badRequest, gone, notAcceptable, notFound, serviceUnavailable, unauthorized, unprocessableContent } from "@/responses/responses"
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
    if (!sessionID || !signupID || !suName || !suSurname || !suEmail || !suPhonenumber || !suIscompany || !suSupprice || !suAdress || !suAttendees) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID)
    if (!signup) { return notFound(rm021000) }
    const signupInvoiceCount = await getSignupInvoiceCount(db, signupID)
    if (signupInvoiceCount > 0) { return unprocessableContent(rm021005) }
    if (signup.attendees.length < suAttendees.length){
        if (signup.courseID && !signup.offerID) { //COURSE
            const course = await ADMgetCourse(db, signup.courseID)
            if (!course) { return gone(rm021008) }
            if (course.slotsUsed - signup.attendees.length + suAttendees.length > course.slots) { return notAcceptable(rm021010) }
        } else if (signup.offerID && !signup.courseID) { //OFFER
            const courses = (await getOffer(db, signup.offerID))?.courses
            if (!courses) { return gone(rm021009) }
            const ADMcourses = await Promise.all(courses.map(course => ADMgetCourse(db, course.id))) as ADMcourseElement[]
            const courseStates = await Promise.all(ADMcourses.map(course => {
                if (course.slotsUsed - signup.attendees.length + suAttendees.length > course.slots) { return false }
                return true
            }))
            if (courseStates.includes(false)) { return notAcceptable(rm021010) }
        } else { return serviceUnavailable(rm021011) }
    }
    const changedSignup = await updateSignup(db, signupID, utf8.decode(suName), utf8.decode(suSurname), utf8.decode(suEmail), suPhonenumber, utf8.decode(suAdress), suPesel ? suPesel : undefined, suIscompany, suCompanyname ? utf8.decode(suCompanyname): undefined, suCompanyNIP ? suCompanyNIP : undefined, suSupprice, suAttendees)
    if (!changedSignup) { return unprocessableContent(rm021006) }
    return NextResponse.json(changedSignup, {status: 200})
}