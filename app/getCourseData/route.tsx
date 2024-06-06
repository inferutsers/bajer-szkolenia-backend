'use server'

import getDatabase from "@/connection/database"
import courseElement from "@/interfaces/courseElement"
import { badRequest, noContent, serviceUnavailable } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers
    const courseID = headers.get("courseID")
    if (!courseID) { return badRequest }
    const db = await getDatabase()
    const results = await db.query("SELECT * FROM courses WHERE id = $1 LIMIT 1", [courseID])
    if (!results || results.rowCount == 0) { return noContent }
    const result: courseElement = results.rows.map((result) => ({id: result.id, date: result.date, span: result.span, price: result.price, title: result.title, place: result.place, instructor: result.instructor, note: result.note, slots: result.slots, available: result.available }))[0]
    if (!result) { return serviceUnavailable }
    return NextResponse.json(result, {status: 200})
}