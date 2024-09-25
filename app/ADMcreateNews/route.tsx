import getDatabase from "@/connection/database"
import getBufferFromString from "@/functions/getBufferFromString"
import { dumpObject, systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import processBody from "@/functions/processBody"
import { createNews } from "@/functions/queries/news"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm031006 } from "@/responses/messages"
import { badRequest, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextRequest, NextResponse } from "next/server"
import utf8 from "utf8"

export async function POST(req: NextRequest, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    date = headers.get("CDate"),
    title = headers.get("CTitle"),
    description = headers.get("CDescription"),
    pin = headers.get("CPin"),
    image = await processBody(req)
    if (!sessionID || !date || !title || !description || !pin) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const imgbufer = await getBufferFromString(image)
    const insertedNews = await createNews(db, utf8.decode(title), utf8.decode(description), date, pin, imgbufer)
    if (!insertedNews) { systemLog(systemAction.ADMcreateNews, systemActionStatus.error, rm031006, validatedUser, db); return unprocessableContent(rm031006) }
    systemLog(systemAction.ADMcreateNews, systemActionStatus.success, `Stworzono aktualność\n${dumpObject(insertedNews)}`, validatedUser, db)
    return NextResponse.json(insertedNews, {status: 200})
}