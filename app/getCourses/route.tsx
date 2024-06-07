'use server'
import getDatabase from "@/connection/database";
import { getSlotAvailability } from "@/functions/getSlotAvailability";
import courseElement from "@/interfaces/courseElement";
import { noContent } from "@/responses/responses";
import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET(req: Request, res: Response){
    const _ = req.headers
    const db = await getDatabase()
    const results = await db.query('SELECT * FROM courses')
    if (results.rowCount == 0){ return noContent }
    var elements: courseElement[] = await Promise.all(results.rows.map(async (result) => ({ id: result.id, date: result.date, span: result.span, price: result.price, title: result.title, place: result.place, instructor: result.instructor, note: result.note, slots: result.slots, slotAvailable: await getSlotAvailability(db, result.id, result.slots), available: result.available }) ))
    return NextResponse.json(elements, {status: 200})
}
