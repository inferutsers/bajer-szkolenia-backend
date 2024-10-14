import getDatabase from "@/connection/database"
import validateCRONSecret from "@/functions/AUTOCRON/validateCRONSecret"
import { getDateLongGMT2Readable } from "@/functions/dates"
import sendSingleEmail from "@/functions/emails/processor/sendSingleEmail"
import { getCourseSignups } from "@/functions/getCourseSignups"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { ADMlockDueCourses, getUpcomingCourses } from "@/functions/queries/course"
import { sendCourseReminders } from "@/functions/sendCourseReminders"
import { rm001000, rm001001 } from "@/responses/messages"
import { badRequest, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    providedSecret = headers.get("AUTOCRONSECRET")
    if (!headers || !providedSecret) { return badRequest(rm001001) }
    if (!validateCRONSecret(providedSecret)) { return unauthorized(rm001000) }
    const db = await getDatabase(req)
    const signupsReminded = await sendCourseReminders(db)
    if (signupsReminded > 0) {
        systemLog(systemAction.AUTOCRONlockcourses, systemActionStatus.success, `Powiadomiono ${signupsReminded} zapisów`, undefined, db)
    }
    return NextResponse.json(`${getDateLongGMT2Readable()} >>> Notified ${signupsReminded} signups...`, {status: 200})
}