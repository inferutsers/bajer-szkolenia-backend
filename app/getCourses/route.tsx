'use server'
import getDatabase from "@/connection/database";
import courseElement from "@/interfaces/courseElement";
import { noContent } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const _ = req.headers
    const db = await getDatabase()
    const results = await db.query('SELECT * FROM courses')
    if (results.rowCount == 0){ return noContent }
    const elements: courseElement[] = results.rows.map((result) => ({ id: result.id, date: result.date, span: result.span, price: result.price, title: result.title, place: result.place, instructor: result.instructor, note: result.note }) )
    return NextResponse.json(elements, {status: 200})
}