import getDatabase from "@/connection/database";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { getOffer, deleteFile } from "@/functions/queries/offer";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm041000, rm041004 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";

export async function DELETE(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    offerID = headers.get("offerID")
    if (!sessionID || !offerID) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const offer = await getOffer(db, offerID)
    if (!offer) { systemLog(systemAction.ADMdeleteOfferFile, systemActionStatus.error, rm041000, validatedUser, db); return notFound(rm041000) }
    const offerUpdated = await deleteFile(db, offer.id)
    if (offerUpdated == false) { systemLog(systemAction.ADMdeleteOfferFile, systemActionStatus.error, rm041004, validatedUser, db); return unprocessableContent(rm041004) }
    systemLog(systemAction.ADMdeleteOfferFile, systemActionStatus.success, `Usunięto plik z pakietu #${offer.id}`, validatedUser, db);
    return Response.json(null, {status: 200})
}