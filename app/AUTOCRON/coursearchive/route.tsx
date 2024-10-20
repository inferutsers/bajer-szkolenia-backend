import getDatabase from "@/connection/database"
import validateCRONSecret from "@/functions/AUTOCRON/validateCRONSecret"
import { getDateLongGMT2Readable } from "@/functions/dates"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { ADMarchiveCourses } from "@/functions/queries/course"
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
    const entriesArchived = await ADMarchiveCourses(db)
    if (entriesArchived.filter((element) => { return (element != 0) }).length > 0) {
        systemLog(systemAction.AUTOCRONcoursearchive, systemActionStatus.success, `Archiwizowano ${entriesArchived[0]} szkoleń, ${entriesArchived[1]} zapisów`, undefined, db)
    }
    return NextResponse.json(`${getDateLongGMT2Readable()} >>> Archived ${entriesArchived[0]} courses, ${entriesArchived[1]} signups...`, {status: 200})
}