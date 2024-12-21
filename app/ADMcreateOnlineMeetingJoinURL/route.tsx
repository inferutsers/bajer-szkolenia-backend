import getDatabase from "@/connection/database";
import { generateAttendeeURL } from "@/functions/clickmeeting/generateAttendeeURL";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { ADMgetCourse } from "@/functions/queries/course";
import { addWebinarUrls, getSignup } from "@/functions/queries/signups";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm121000, rm121002, rm121003, rm121004, rm121007 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";

export async function POST(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID)
    if (!signup || !signup.courseID) { systemLog(systemAction.ADMcreateOnlineMeetingJoinURL, systemActionStatus.error, rm121002, validatedUser, db); return notFound(rm121002) }
    if (signup.webinarURLs) { systemLog(systemAction.ADMcreateOnlineMeetingJoinURL, systemActionStatus.error, rm121007, validatedUser, db); return unprocessableContent(rm121007) }
    const course = await ADMgetCourse(db, signup.courseID)
    if (!course) { systemLog(systemAction.ADMcreateOnlineMeetingJoinURL, systemActionStatus.error, rm121000, validatedUser, db); return unprocessableContent(rm121000) }
    const conference = course.webinar
    if (!conference?.id) { systemLog(systemAction.ADMcreateOnlineMeetingJoinURL, systemActionStatus.error, rm121003, validatedUser, db); return unprocessableContent(rm121003) }
    const loginURLs = await generateAttendeeURL(conference, signup.attendees.map(attendee => ({name: attendee, email: signup.email})))
    if (!loginURLs) { systemLog(systemAction.ADMcreateOnlineMeetingJoinURL, systemActionStatus.error, rm121004, validatedUser, db); return unprocessableContent(rm121004) }
    const signupUpdate = await addWebinarUrls(db, signup.id, loginURLs)
    if (!signupUpdate) { systemLog(systemAction.ADMcreateOnlineMeetingJoinURL, systemActionStatus.error, rm121004, validatedUser, db); return unprocessableContent(rm121004) }
    systemLog(systemAction.ADMcreateOnlineMeetingJoinURL, systemActionStatus.success, `Stworzono link(i) do dołączenia do webinaru dla uczestnika #${signup.id}\n${loginURLs.map(url => `${url.name}: ${url.url} (tkn: ${url.token})\n`)}`, validatedUser, db)
    return Response.json(loginURLs, {status: 200})
}