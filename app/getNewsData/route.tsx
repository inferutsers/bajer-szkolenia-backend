import getDatabase from "@/connection/database"
import newsElement from "@/interfaces/newsElement"
import { badRequest, notFound } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers
    const newsID = headers.get("newsID")
    if (!newsID) { return badRequest }
    const db = await getDatabase(req)
    const currentDate = new Date()
    const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`
    const results = await db.query('SELECT * FROM news WHERE id = $1 AND date <= $2 LIMIT 1', [newsID, currentDateFormatted])
    if (!results || results.rowCount == 0){ return notFound }
    const elements: newsElement[] = results.rows.map((result) => ({ id: result.id, title: result.title, description: result.description, date: result.date, pin: result.pin, image: result.image }) )
    return NextResponse.json(elements, {status: 200})
}