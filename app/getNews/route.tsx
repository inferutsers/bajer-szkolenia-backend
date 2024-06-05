'use server'
import getDatabase from "@/connection/database";
import { noContent } from "@/responses/responses";
import { NextResponse } from "next/server";

interface newsElement{
    id: Number,
    title?: String,
    description?: String,
    date?: Date,
    pin: Boolean
}

export async function GET(req: Request, res: Response){
    const _ = req.headers
    const db = await getDatabase()
    const results = await db.query('SELECT * FROM news')
    if (results.rowCount == 0){ return noContent }
    const elements: newsElement[] = results.rows.map((result) => ({ id: result.id, title: result.title, description: result.description, date: result.date, pin: result.pin }) )
    return NextResponse.json(elements, {status: 200})
}