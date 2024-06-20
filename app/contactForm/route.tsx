import getDatabase from "@/connection/database"
import { getCurrentDateLong } from "@/functions/dates"
import { badRequest } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response){
    const headers = req.headers
    const email = headers.get("email")
    const message = headers.get("message")
    if (!email || !message) { return badRequest }
    const db = await getDatabase(req)
    await db.query('INSERT INTO "contact"("email", "message", "date") VALUES ($1, $2, $3)', [email, message, getCurrentDateLong()])
    return NextResponse.json(null, {status: 200})
}