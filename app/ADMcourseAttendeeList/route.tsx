import getDatabase from "@/connection/database";
import { getCourseSignups } from "@/functions/getCourseSignups";
import { ADMgetCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { badRequest, noContent, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";
import jsPDF from 'jspdf'

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID")
    if (!sessionID || !courseID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const signups = await getCourseSignups(db, courseID)
    if (!signups){ return noContent }
    const pdf = new jsPDF()
    pdf.text("TO BE DONE... TESTOWY PDF", 1, 1)
    const attendees: {companyName: String, attendees: String}[] = (signups.map(result => 
        ({companyName: (result.companyName ? result.companyName : "OSOBA PRYWATNA"), attendees: result.attendees.join(", ")})
    ))
    return NextResponse.json({pdf: Buffer.from(pdf.output(), 'binary'), attendees: attendees}, {status: 200})
}