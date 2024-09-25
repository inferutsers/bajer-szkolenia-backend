import getDatabase from "@/connection/database"
import getBufferFromString from "@/functions/getBufferFromString"
import processBody from "@/functions/processBody"
import { getAllNewsData, updateNews } from "@/functions/queries/news"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm031000, rm031005 } from "@/responses/messages"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextRequest, NextResponse } from "next/server"
import utf8 from "utf8"

export async function PATCH(req: NextRequest, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    newsID = headers.get("newsID"),
    date = headers.get("CDate"),
    title = headers.get("CTitle"),
    description = headers.get("CDescription"),
    pin = headers.get("CPin"),
    image = await processBody(req)
    if (!sessionID || !newsID || !date || !title || !description || !pin) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const news = await getAllNewsData(db, newsID)
    if (!news) { return notFound(rm031000) }
    const imgbufer = await getBufferFromString(image)
    const changedNews = await updateNews(db, newsID, utf8.decode(title), utf8.decode(description), date, pin, imgbufer)
    if (!changedNews) { return unprocessableContent(rm031005) }
    return NextResponse.json(changedNews, {status: 200})
}