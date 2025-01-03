import getDatabase from "@/connection/database";
import { ADMgetNews } from "@/functions/queries/news";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm031100 } from "@/responses/messages";
import { badRequest, noContent, unauthorized } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const news = await ADMgetNews(db)
    if (!news) { return noContent(rm031100) }
    return Response.json(news, {status: 200})
}