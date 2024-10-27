import getDatabase from "@/connection/database";
import { dumpObject, systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { deleteOffer, getOffer } from "@/functions/queries/offer";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm041000, rm041002 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";

export async function DELETE(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    offerID = headers.get("offerID")
    if (!sessionID || !offerID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const offer = await getOffer(db, offerID)
    if (!offer) { systemLog(systemAction.ADMdeleteOffer, systemActionStatus.error, rm041000, validatedUser, db); return notFound(rm041000) }
    const signups = 1 + 1
    if (signups != 0) { systemLog(systemAction.ADMdeleteOffer, systemActionStatus.error, rm041002, validatedUser, db); return unprocessableContent(rm041002) }
    await deleteOffer(db, offerID)
    systemLog(systemAction.ADMdeleteOffer, systemActionStatus.success, `Usunięto pakiet\n${dumpObject(offer)}`, validatedUser, db);
    return Response.json(null, {status: 200})
}