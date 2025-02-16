import getDatabase from "@/connection/database"
import validateCRONSecret from "@/functions/AUTOCRON/validateCRONSecret"
import { getEmailQueueElement } from "@/functions/queries/email"
import { rm001000, rm001001 } from "@/responses/messages"
import { badRequest, unauthorized } from "@/responses/responses"

export async function GET(req: Request){
    const headers = req.headers,
    providedSecret = headers.get("AUTOCRONSECRET")
    if (!headers || !providedSecret) { return badRequest(rm001001) }
    if (!validateCRONSecret(providedSecret)) { return unauthorized(rm001000) }
    const db = await getDatabase(req)
    const email = await getEmailQueueElement(db)
    if (!email){ return Response.json(`No element to process`, {status: 200}) }
}