import getDatabase from "@/connection/database"
import validateCRONSecret from "@/functions/AUTOCRON/validateCRONSecret"
import { getDateLongGMT2Readable } from "@/functions/dates"
import { systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { ADMlockDueCourses } from "@/functions/queries/course"
import { rm001000, rm001001 } from "@/responses/messages"
import { badRequest, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    providedSecret = headers.get("AUTOCRONSECRET")
    if (!headers || !providedSecret) { return badRequest(rm001001) }
    if (!validateCRONSecret(providedSecret)) { return unauthorized(rm001000) }
    const db = await getDatabase(req)
    const coursesLocked = await ADMlockDueCourses(db)
    if (coursesLocked > 0) {
        systemLog(systemAction.AUTOCRONlockcourses, systemActionStatus.success, `Zablokowano ${coursesLocked} szkoleń`, undefined, db)
    }
    return NextResponse.json(`${getDateLongGMT2Readable()} >>> Locked ${coursesLocked} courses...`, {status: 200})
}