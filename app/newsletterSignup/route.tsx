import getDatabase from "@/connection/database"
import signupForNewsletter from "@/functions/signupForNewsletter"
import { rm001001, rm091004 } from "@/responses/messages"
import { badRequest, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response){
    const headers = req.headers,
    email = headers.get("email")
    if (!email) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const status = await signupForNewsletter(db, email)
    if (!status.success) { return unprocessableContent(rm091004) }
    return NextResponse.json(null, {status: 200})
}