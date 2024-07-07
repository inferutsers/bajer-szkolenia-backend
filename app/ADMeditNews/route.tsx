import getDatabase from "@/connection/database"
import getBufferFromImage from "@/functions/getBufferFromImage"
import processBody from "@/functions/processBody"
import { getNewsData, updateNews } from "@/functions/queries/news"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized } from "@/responses/responses"
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
    if (!sessionID || !newsID || !date || !title || !description || !pin) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const news = await getNewsData(db, newsID)
    if (!news) { return notFound }
    const imgbufer = await getBufferFromImage(image)
    const changedNews = await updateNews(db, newsID, utf8.decode(title), utf8.decode(description), date, pin, imgbufer)
    if (!changedNews) { return badRequest }
    return NextResponse.json(changedNews, {status: 200})
}