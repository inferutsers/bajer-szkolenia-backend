import getDatabase from "@/connection/database";
import { getPinnedNews } from "@/functions/queries/news";
import { rm031100 } from "@/responses/messages";
import { noContent } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const _ = req.headers,
    db = await getDatabase(req),
    news = await getPinnedNews(db)
    if (!news){ return noContent(rm031100) }
    return NextResponse.json(news, {status: 200})
}