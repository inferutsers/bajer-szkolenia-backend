import getDatabase from "@/connection/database";
import { getOffer, deleteFile } from "@/functions/queries/offer";
import validateSession from "@/functions/validateSession";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    offerID = headers.get("offerID")
    if (!sessionID || !offerID) { return badRequest }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const offer = await getOffer(db, offerID)
    if (!offer) { return notFound }
    const offerUpdated = await deleteFile(db, offer.id)
    if (offerUpdated == false) { return unprocessableContent }
    return NextResponse.json(null, {status: 200})
}