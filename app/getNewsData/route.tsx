import getDatabase from "@/connection/database"
import { getNewsData } from "@/functions/queries/news"
import { badRequest, notFound } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers,
    newsID = headers.get("newsID")
    if (!newsID) { return badRequest }
    const db = await getDatabase(req)
    const newsData = await getNewsData(db, newsID)
    if (!newsData) { return notFound }
    return NextResponse.json(newsData, {status: 200})
}