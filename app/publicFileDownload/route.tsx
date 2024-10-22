import getDatabase from "@/connection/database";
import { getPublicFile } from "@/functions/queries/publicFiles";
import { rm001001, rm101000 } from "@/responses/messages";
import { badRequest, notFound } from "@/responses/responses";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: Response){
    const headers = req.headers,
    key = headers.get("fileKey")
    if (!key) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const file = await getPublicFile(db, key)
    if (!file) { return notFound(rm101000) }
    return NextResponse.json(file, {status: 200})
}