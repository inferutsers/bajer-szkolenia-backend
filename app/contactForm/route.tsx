import getDatabase from "@/connection/database"
import { insertContactMessage } from "@/functions/queries/contact"
import { badRequest } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    email = headers.get("email"),
    message = headers.get("message")
    if (!email || !message) { return badRequest }
    const db = await getDatabase(req)
    await insertContactMessage(db, message, email)
    return NextResponse.json(null, {status: 200})
}