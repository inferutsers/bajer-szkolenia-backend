import getDatabase from "@/connection/database"
import { getNewsletterUserPresenceByConfirmationKey } from "@/functions/queries/newsletter"
import { badRequest, notFound } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response){
    const headers = req.headers
    const confirmationKey = headers.get("confirmationKey")
    if (!confirmationKey) { return badRequest }
    const db = await getDatabase(req)
    const isThereAKeyLikeThat = await getNewsletterUserPresenceByConfirmationKey(db, confirmationKey)
    if (!isThereAKeyLikeThat) { return notFound }
    await db.query('UPDATE "newsletterUsers" SET "confirmed" = true WHERE "confirmationKey" = $1', [confirmationKey])
    return NextResponse.json(null, {status: 200})
}