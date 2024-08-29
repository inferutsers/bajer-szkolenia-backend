import getDatabase from "@/connection/database";
import { deleteNews, getAllNewsData } from "@/functions/queries/news";
import validateSession from "@/functions/validateSession";
import { badRequest, notFound, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    newsID = headers.get("newsID")
    if (!sessionID || !newsID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const news = await getAllNewsData(db, newsID)
    if (!news) { return notFound }
    await deleteNews(db, newsID)
    return NextResponse.json(null, {status: 200})
}