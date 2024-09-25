import getDatabase from "@/connection/database";
import getOfferSignupCount from "@/functions/getOfferSignupCount";
import { deleteOffer, getOffer } from "@/functions/queries/offer";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm041000, rm041002 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    offerID = headers.get("offerID")
    if (!sessionID || !offerID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const offer = await getOffer(db, offerID)
    if (!offer) { return notFound(rm041000) }
    const signups = await getOfferSignupCount(db, offerID)
    if (signups != 0) { return unprocessableContent(rm041002) }
    await deleteOffer(db, offerID)
    return NextResponse.json(null, {status: 200})
}