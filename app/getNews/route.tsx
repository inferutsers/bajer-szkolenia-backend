import getDatabase from "@/connection/database";
import { getNews } from "@/functions/queries/news";
import { rm031100 } from "@/responses/messages";
import { noContent } from "@/responses/responses";

export async function GET(req: Request){
    const _ = req.headers,
    db = await getDatabase(req),
    news = await getNews(db)
    if (!news) { return noContent(rm031100) }
    return Response.json(news, {status: 200})
}