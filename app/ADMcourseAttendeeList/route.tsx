import getDatabase from "@/connection/database";
import { getCourseSignups } from "@/functions/getCourseSignups";
import { ADMgetCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { badRequest, noContent, notFound, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";
import { getDateShortReadable } from "@/functions/dates";
import generateAttendeeListPDF from "@/functions/generateAttendeeListPDF";

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const course = await ADMgetCourse(db, courseID)
    if (!course){return notFound}
    const signups = await getCourseSignups(db, courseID)
    if (!signups){ return noContent }
    const pdf = await generateAttendeeListPDF(course, signups, validatedUser)
    const attendees: {companyName: String, attendees: String, status: String}[] = (signups.map(result => 
        ({companyName: (result.companyName ? result.companyName : "OSOBA PRYWATNA"), attendees: result.attendees.join(", "), status: (result.paidIn >= result.supPrice ? (result.invoiceNumber ? `Opłacone - Faktura #${result.invoiceNumber}` : "Opłacone") : "Nieopłacone")})
    ))
    return NextResponse.json({pdf: pdf, attendees: attendees, date: getDateShortReadable(course.date)}, {status: 200})
}