import getDatabase from "@/connection/database"
import signupForNewsletter from "@/functions/signupForNewsletter"
import { rm001001, rm091004, rm091005 } from "@/responses/messages"
import { badRequest, unprocessableContent } from "@/responses/responses"

export async function POST(req: Request){
    const headers = req.headers,
    email = headers.get("email")
    if (!email) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const status = await signupForNewsletter(db, email)
    if (!status.success && status.isPresent) { return unprocessableContent(rm091005) }
    if (!status.success) { return unprocessableContent(rm091004) }
    return Response.json(null, {status: 200})
}