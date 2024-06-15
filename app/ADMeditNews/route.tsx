import getDatabase from "@/connection/database"
import getBufferFromImage from "@/functions/getBufferFromImage"
import validateSession from "@/functions/validateSession"
import newsElement from "@/interfaces/newsElement"
import { badRequest, notFound, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"

export async function PATCH(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const newsID = headers.get("newsID")
    const date = headers.get("CDate")
    const title = headers.get("CTitle")
    const description = headers.get("CDescription")
    const pin = headers.get("CPin")
    const image = await req.json()
    if (!sessionID || !newsID || !date || !title || !description || !pin) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const newsFoundArray = await db.query('SELECT * FROM "news" WHERE "id" = $1 LIMIT 1', [newsID])
    if (!newsFoundArray || newsFoundArray.rowCount == 0) { return notFound }
    const imgbufer = await getBufferFromImage(image)
    const changedNewsArray = await db.query('UPDATE "news" SET "title" = $1, "description" = $2, "date" = $3, "pin" = $4, "image" = $5 WHERE "id" = $6 RETURNING *', [utf8.decode(title), utf8.decode(description), date, pin, imgbufer, newsID])
    if (!changedNewsArray || changedNewsArray.rowCount == 0) { return badRequest }
    var changedNews: newsElement = changedNewsArray.rows.map((result) => ({ id: result.id, title: result.title, description: result.description, date: result.date, pin: result.pin, image: result.image }))[0]
    return NextResponse.json(changedNews, {status: 200})
}