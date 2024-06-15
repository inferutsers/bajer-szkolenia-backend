import getDatabase from "@/connection/database"
import getBufferFromImage from "@/functions/getBufferFromImage"
import processBody from "@/functions/processBody"
import validateSession from "@/functions/validateSession"
import newsElement from "@/interfaces/newsElement"
import { badRequest, unauthorized } from "@/responses/responses"
import { NextRequest, NextResponse } from "next/server"
import utf8 from "utf8"

export async function POST(req: NextRequest, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const date = headers.get("CDate")
    const title = headers.get("CTitle")
    const description = headers.get("CDescription")
    const pin = headers.get("CPin")
    const image = await processBody(req)
    if (!sessionID || !date || !title || !description || !pin) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const imgbufer = await getBufferFromImage(image)
    const insertedNewsArray = await db.query('INSERT INTO "news"("title", "description", "date", "pin", "image") VALUES ($1, $2, $3, $4, $5) RETURNING *', [utf8.decode(title), utf8.decode(description), date, pin, imgbufer])
    if (!insertedNewsArray || insertedNewsArray.rowCount == 0) { return badRequest }
    var insertedNews: newsElement = insertedNewsArray.rows.map((result) => ({ id: result.id, title: result.title, description: result.description, date: result.date, pin: result.pin, image: result.image }))[0]
    return NextResponse.json(insertedNews, {status: 200})
}