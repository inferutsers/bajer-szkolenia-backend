import getDatabase from "@/connection/database";
import { getNews } from "@/functions/queries/news";
import { noContent } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const _ = req.headers,
    db = await getDatabase(req),
    news = await getNews(db)
    if (!news) { return noContent }
    return NextResponse.json(news, {status: 200})
}