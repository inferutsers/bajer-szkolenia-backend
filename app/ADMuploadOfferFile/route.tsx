import getDatabase from "@/connection/database";
import getBufferFromString from "@/functions/getBufferFromString";
import processBody from "@/functions/processBody";
import { getOffer, uploadFile } from "@/functions/queries/offer";
import validateSession from "@/functions/validateSession";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";
import utf8 from 'utf8'

export async function POST(req: NextRequest, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    offerID = headers.get("offerID"),
    fileName = headers.get("fileName"),
    file = await processBody(req)
    if (!sessionID || !offerID || !fileName || !file) { return badRequest }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const offer = await getOffer(db, offerID)
    if (!offer) { return notFound }
    const buffer = await getBufferFromString(file)
    if (!buffer) { return unprocessableContent }
    const updatedOffer = await uploadFile(db, offer.id, buffer, utf8.decode(fileName))
    if (updatedOffer == false) { return unprocessableContent }
    return NextResponse.json(null, {status: 200})
}