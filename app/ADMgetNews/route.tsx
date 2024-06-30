import getDatabase from "@/connection/database";
import { ADMgetNews } from "@/functions/queries/news";
import validateSession from "@/functions/validateSession";
import { badRequest, noContent, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const news = await ADMgetNews(db)
    if (!news) { return noContent }
    return NextResponse.json(news, {status: 200})
}