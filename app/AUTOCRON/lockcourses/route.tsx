import getDatabase from "@/connection/database"
import validateCRONSecret from "@/functions/AUTOCRON/validateCRONSecret"
import { getDateLongGMT2Readable } from "@/functions/dates"
import { ADMlockDueCourses } from "@/functions/queries/course"
import { badRequest, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    providedSecret = headers.get("AUTOCRONSECRET")
    if (!headers || !providedSecret) { return badRequest }
    if (!validateCRONSecret(providedSecret)) { return unauthorized }
    const db = await getDatabase(req)
    return NextResponse.json(`${getDateLongGMT2Readable()} >>> Locked ${await ADMlockDueCourses(db)} courses...`, {status: 200})
}