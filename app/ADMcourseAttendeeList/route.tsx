import getDatabase from "@/connection/database";
import { ADMgetArchivedCourse, ADMgetCourse } from "@/functions/queries/course";
import validateSession from "@/functions/validateSession";
import { badRequest, noContent, notFound, unauthorized } from "@/responses/responses";
import { rm001000, rm001001, rm011000, rm011001 } from "@/responses/messages";
import { getCourseSignups } from "@/functions/queries/signups";

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    courseID = headers.get("courseID"),
    archive = headers.get("archive")
    if (!sessionID || !courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const course = archive === "true" ? (await ADMgetArchivedCourse(db, courseID)) : (await ADMgetCourse(db, courseID))
    if (!course){return notFound(rm011000) }
    const signups = await getCourseSignups(db, courseID, archive === "true")
    if (!signups){ return noContent(rm011001) }
    const attendees: {companyName: String, attendees: String, status: String}[] = (signups.map(result => 
        ({companyName: (result.companyName ? result.companyName : "OSOBA PRYWATNA"), attendees: result.attendees.join(", "), status: (result.paidIn >= result.supPrice ? (result.invoiceNumber ? `Opłacone - Faktura ${result.invoiceNumber}` : "Opłacone") : "Nieopłacone")})
    ))
    return Response.json({attendees: attendees}, {status: 200})
}