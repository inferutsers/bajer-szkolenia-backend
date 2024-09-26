import getDatabase from "@/connection/database";
import getBufferFromString from "@/functions/getBufferFromString";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import processBody from "@/functions/processBody";
import { getOffer, uploadFile } from "@/functions/queries/offer";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm041000, rm041007, rm041008 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";
import utf8 from 'utf8'

export async function POST(req: NextRequest, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    offerID = headers.get("offerID"),
    fileName = headers.get("fileName"),
    file = await processBody(req)
    if (!sessionID || !offerID || !fileName || !file) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const offer = await getOffer(db, offerID)
    if (!offer) { systemLog(systemAction.ADMuploadOfferFile, systemActionStatus.error, rm041000, validatedUser, db); return notFound(rm041000) }
    const buffer = await getBufferFromString(file)
    if (!buffer) { systemLog(systemAction.ADMuploadOfferFile, systemActionStatus.error, rm041007, validatedUser, db); return unprocessableContent(rm041007) }
    const updatedOffer = await uploadFile(db, offer.id, buffer, utf8.decode(fileName))
    if (updatedOffer == false) { systemLog(systemAction.ADMuploadOfferFile, systemActionStatus.error, rm041008, validatedUser, db); return unprocessableContent(rm041008) }
    systemLog(systemAction.ADMuploadOfferFile, systemActionStatus.success, `Załączono plik do pakietu #${offer.id}`, validatedUser, db);
    return NextResponse.json(null, {status: 200})
}