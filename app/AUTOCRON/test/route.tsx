import validateCRONSecret from "@/functions/AUTOCRON/validateCRONSecret"
import sendSingleEmail from "@/functions/emails/processor/sendSingleEmail"
import { badRequest, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    providedSecret = headers.get("AUTOCRONSECRET")
    if (!headers || !providedSecret) { return badRequest }
    if (!validateCRONSecret(providedSecret)) { return unauthorized }
    sendSingleEmail("mateuszzalewski18@gmail.com", "crontest", "test", "<b>test</b>")
    return NextResponse.json(null, {status: 200})
}