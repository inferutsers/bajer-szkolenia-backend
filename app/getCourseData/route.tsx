'use server'

import getDatabase from "@/connection/database"
import courseElement from "@/interfaces/courseElement"
import { badRequest, noContent, notFound, serviceUnavailable } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers
    const courseID = headers.get("courseID")
    if (!courseID) { return badRequest }
    const db = await getDatabase()
    const currentDate = new Date()
    const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}+${currentDate.getTimezoneOffset()}`
    const results = await db.query("SELECT * FROM courses WHERE id = $1 AND date > $2 LIMIT 1", [courseID, currentDateFormatted])
    if (!results || results.rowCount == 0) { return notFound }
    const courseSignupsArray = await db.query('SELECT "id" from "signups" WHERE "courseID" = $1', [courseID])
    const courseSignupsAmount = courseSignupsArray.rowCount as Number
    const result: courseElement = results.rows.map((result) => ({id: result.id, date: result.date, span: result.span, price: result.price, title: result.title, place: result.place, instructor: result.instructor, note: result.note, slots: result.slots, slotAvailable: (courseSignupsAmount < result.slots) as boolean, available: result.available }))[0]
    if (!result) { return serviceUnavailable }
    return NextResponse.json(result, {status: 200})
}