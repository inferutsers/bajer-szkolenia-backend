'use server'
import getDatabase from "@/connection/database";
import newsElement from "@/interfaces/newsElement";
import { noContent } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const _ = req.headers
    const db = await getDatabase()
    const currentDate = new Date()
    const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`
    const results = await db.query('SELECT * FROM news WHERE pin = true AND date <= $1 ORDER BY date DESC LIMIT 4', [currentDateFormatted])
    if (results.rowCount == 0){ return noContent }
    const elements: newsElement[] = results.rows.map((result) => ({ id: result.id, title: result.title, description: result.description, date: result.date, pin: result.pin, image: result.image }) )
    return NextResponse.json(elements, {status: 200})
}