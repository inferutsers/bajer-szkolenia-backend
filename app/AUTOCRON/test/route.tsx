import getDatabase from "@/connection/database"
import validateCRONSecret from "@/functions/AUTOCRON/validateCRONSecret"
import sendSingleEmail from "@/functions/emails/processor/sendSingleEmail"
import { badRequest, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    providedSecret = headers.get("AUTOCRONSECRET")
    if (!headers || !providedSecret) { return badRequest }
    if (!validateCRONSecret(providedSecret)) { return unauthorized }
    const _ = await getDatabase(req)
    // sendSingleEmail("kkacper4354@gmail.com", "SYSTEM NOTIFY", "Message available only in HTML client...", "<b>Administrator Kacper Bajer #1000, kkacper4354@gmail.com</b>\nSession undefined")
    // sendSingleEmail("mateuszzalewski18@gmail.com", "SYSTEM NOTIFY", "Message available only in HTML client...", "<b>Administrator Mateusz Zalewski #1003, mateuszzalewski18@gmail.com</b>\nSession undefined")
    return NextResponse.json(null, {status: 200})
}