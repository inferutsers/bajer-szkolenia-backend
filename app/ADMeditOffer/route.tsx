import getDatabase from "@/connection/database"
import { getOffer, updateOffer } from "@/functions/queries/offer"
import validateSession from "@/functions/validateSession"
import { badRequest, notFound, unauthorized } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"

export async function PATCH(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    offerID = headers.get("offerID"),
    name = headers.get("OName"),
    note = headers.get("ONote"),
    price = headers.get("OPrice")
    if (!sessionID || !offerID || !name || !price) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const offer = await getOffer(db, offerID)
    if (!offer) { return notFound }
    const changedOffer = await updateOffer(
        db,
        offerID,
        utf8.decode(name), 
        (note ? utf8.decode(note) : undefined), price
    )
    if (!changedOffer) { return badRequest }
    return NextResponse.json(changedOffer, {status: 200})
}