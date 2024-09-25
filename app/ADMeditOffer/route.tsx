import getDatabase from "@/connection/database"
import { compareObjects, systemAction, systemActionStatus } from "@/functions/logging/actions"
import { systemLog } from "@/functions/logging/log"
import { getOffer, updateOffer } from "@/functions/queries/offer"
import validateSession from "@/functions/validateSession"
import { rm001000, rm001001, rm041000, rm041005 } from "@/responses/messages"
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses"
import { NextResponse } from "next/server"
import utf8 from "utf8"

export async function PATCH(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    offerID = headers.get("offerID"),
    name = headers.get("OName"),
    note = headers.get("ONote"),
    price = headers.get("OPrice")
    if (!sessionID || !offerID || !name || !price) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const offer = await getOffer(db, offerID)
    if (!offer) { systemLog(systemAction.ADMeditOffer, systemActionStatus.error, rm041000, validatedUser, db); return notFound(rm041000) }
    const changedOffer = await updateOffer(
        db,
        offerID,
        utf8.decode(name), 
        (note ? utf8.decode(note) : undefined), price
    )
    if (!changedOffer) { systemLog(systemAction.ADMeditOffer, systemActionStatus.error, rm041000, validatedUser, db); return unprocessableContent(rm041005) }
    systemLog(systemAction.ADMeditOffer, systemActionStatus.success, `Zmieniono pakiet\n${compareObjects(offer, changedOffer)}`, validatedUser, db);
    return NextResponse.json(changedOffer, {status: 200})
}