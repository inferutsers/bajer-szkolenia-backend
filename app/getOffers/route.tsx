import getDatabase from "@/connection/database";
import { getOffers } from "@/functions/queries/offer";
import { rm041100 } from "@/responses/messages";
import { noContent } from "@/responses/responses";

export async function GET(req: Request){
    const _ = req.headers
    const db = await getDatabase(req)
    const offers = await getOffers(db)
    if (!offers){ return noContent(rm041100) }
    return Response.json(offers, {status: 200})
}