import getDatabase from "@/connection/database";
import { getOffer, deleteFile } from "@/functions/queries/offer";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm041000, rm041004 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    offerID = headers.get("offerID")
    if (!sessionID || !offerID) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const offer = await getOffer(db, offerID)
    if (!offer) { return notFound(rm041000) }
    const offerUpdated = await deleteFile(db, offer.id)
    if (offerUpdated == false) { return unprocessableContent(rm041004) }
    return NextResponse.json(null, {status: 200})
}