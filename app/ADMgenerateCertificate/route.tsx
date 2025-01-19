import getDatabase from "@/connection/database"
import { dumpObject, systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { ADMgetArchivedCourse } from "@/functions/queries/course"
import { getSignup } from "@/functions/queries/signups"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm131000, rm131001, rm131002, rm131003 } from "@/responses/messages"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { generateCertificate } from "@/functions/certificates/generateCertificate"

export async function POST(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    signupID = headers.get("signupID")
    if (!sessionID || !signupID) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const signup = await getSignup(db, signupID, true)
    if (!signup || !signup.courseID) { systemLog(systemAction.ADMgenerateCertificate, systemActionStatus.error, rm131000, validatedUser, db); return notFound(rm131000) }
    if (signup.certificate) { systemLog(systemAction.ADMgenerateCertificate, systemActionStatus.error, rm131002, validatedUser, db); return unprocessableContent(rm131002) }
    const course = await ADMgetArchivedCourse(db, signup.courseID)
    if (!course) { systemLog(systemAction.ADMgenerateCertificate, systemActionStatus.error, rm131001, validatedUser, db); return notFound(rm131001) }
    const certificate = await generateCertificate(db, signup, course)
    if (!certificate.certificate) { systemLog(systemAction.ADMgenerateCertificate, systemActionStatus.error, rm131003, validatedUser, db); return unprocessableContent(rm131003) }
    systemLog(systemAction.ADMgenerateCertificate, systemActionStatus.success, `Wygenerowano zaświadczenia o uczestnictwie\nmailSent: ${certificate.mailSent}\n${dumpObject(certificate.certificate)}`, validatedUser, db)
    return Response.json(certificate, {status: 200})
}