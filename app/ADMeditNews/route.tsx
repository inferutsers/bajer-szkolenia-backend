import getDatabase from "@/connection/database"
import getBufferFromImage from "@/functions/getBufferFromImage"
import processBody from "@/functions/processBody"
import { formatAsNewsElement, getNewsData } from "@/functions/queries/news"
import validateSession from "@/functions/validateSession"
import newsElement from "@/interfaces/newsElement"
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
    const changedNewsArray = await db.query('UPDATE "news" SET "title" = $1, "description" = $2, "date" = $3, "pin" = $4, "image" = $5 WHERE "id" = $6 RETURNING *', [utf8.decode(title), utf8.decode(description), date, pin, imgbufer, newsID])
    if (!changedNewsArray || changedNewsArray.rowCount == 0) { return badRequest }
    var changedNews: newsElement = formatAsNewsElement(changedNewsArray.rows[0])
    return NextResponse.json(changedNews, {status: 200})
}