import getDatabase from "@/connection/database";
import validateSession from "@/functions/validateSession";
import newsElement from "@/interfaces/newsElement";
import { badRequest, noContent, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const currentDate = new Date()
    const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`
    const results = await db.query('SELECT * FROM news ORDER BY date DESC')
    if (results.rowCount == 0){ return noContent }
    const elements: newsElement[] = results.rows.map((result) => ({ id: result.id, title: result.title, description: result.description, date: result.date, pin: result.pin, image: result.image }) )
    return NextResponse.json(elements, {status: 200})
}