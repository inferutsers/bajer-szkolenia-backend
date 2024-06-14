import getDatabase from "@/connection/database";
import newsElement from "@/interfaces/newsElement";
import { noContent } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const _ = req.headers
    const db = await getDatabase(req)
    const currentDate = new Date()
    const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`
    const results = await db.query('SELECT * FROM news WHERE date <= $1 ORDER BY date DESC', [currentDateFormatted])
    if (results.rowCount == 0){ return noContent }
    const elements: newsElement[] = results.rows.map((result) => ({ id: result.id, title: result.title, description: result.description, date: result.date, pin: result.pin, image: result.image }) )
    return NextResponse.json(elements, {status: 200})
}