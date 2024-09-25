import getDatabase from "@/connection/database"
import { getOffer } from "@/functions/queries/offer"
import { rm001001, rm041000 } from "@/responses/messages"
import { badRequest, notFound } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    offerID = headers.get("offerID")
    if (!offerID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const offer = await getOffer(db, offerID)
    if (!offer) { return notFound(rm041000) }
    return NextResponse.json(offer, {status: 200})
}