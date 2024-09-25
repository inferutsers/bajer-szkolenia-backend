import getDatabase from "@/connection/database"
import { getNewsData } from "@/functions/queries/news"
import { rm001001, rm031000 } from "@/responses/messages"
import { badRequest, notFound } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    newsID = headers.get("newsID")
    if (!newsID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const newsData = await getNewsData(db, newsID)
    if (!newsData) { return notFound(rm031000) }
    return NextResponse.json(newsData, {status: 200})
}