import getDatabase from "@/connection/database";
import { getOffer, getOfferFile } from "@/functions/queries/offer";
import { rm001001, rm041000, rm041009 } from "@/responses/messages";
import { badRequest, notFound } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    offerID = headers.get("offerID")
    if (!offerID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const offer = await getOffer(db, offerID)
    if (!offer) { return notFound(rm041000) }
    const offerFile = await getOfferFile(db, offer.id)
    if (!offerFile) { return notFound(rm041009) }
    return Response.json({name: offer.fileName, file: offerFile}, {status: 200})
}