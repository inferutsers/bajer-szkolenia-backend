import getDatabase from "@/connection/database";
import { getOffer, getOfferFile } from "@/functions/queries/offer";
import { badRequest, notFound } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: Response){
    const headers = req.headers,
    offerID = headers.get("offerID")
    if (!offerID) { return badRequest }
    const db = await getDatabase(req)
    const offer = await getOffer(db, offerID)
    if (!offer) { return notFound }
    const offerFile = await getOfferFile(db, offer.id)
    if (!offerFile) { return notFound }
    return NextResponse.json({name: offer.fileName, file: offerFile}, {status: 200})
}