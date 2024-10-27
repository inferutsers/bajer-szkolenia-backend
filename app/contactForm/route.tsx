import getDatabase from "@/connection/database"
import { insertContactMessage } from "@/functions/queries/contact"
import { rm001001 } from "@/responses/messages"
import { badRequest } from "@/responses/responses"
import utf8 from 'utf8'

export async function POST(req: Request){
    const headers = req.headers,
    email = headers.get("email"),
    message = headers.get("message")
    if (!email || !message) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    await insertContactMessage(db, utf8.decode(message), email)
    return Response.json(null, {status: 200})
}