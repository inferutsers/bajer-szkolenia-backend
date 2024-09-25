import getDatabase from "@/connection/database";
import { getOffers } from "@/functions/queries/offer";
import validateSession from "@/functions/validateSession";
import { rm041100 } from "@/responses/messages";
import { badRequest, noContent, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const _ = req.headers
    const db = await getDatabase(req)
    const offers = await getOffers(db)
    if (!offers){ return noContent(rm041100) }
    return NextResponse.json(offers, {status: 200})
}