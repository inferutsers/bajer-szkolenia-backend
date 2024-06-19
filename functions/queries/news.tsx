import newsElement from "@/interfaces/newsElement";
import { Pool } from "pg";
import { getCurrentDateShort } from "../dates";

export async function ADMgetNews(db: Pool): Promise<newsElement[] | undefined>{
    const news = await db.query('SELECT * FROM news ORDER BY date DESC')
    if (!news || news.rowCount == 0) { return undefined }
    const formattedNews = news.rows.map((result) => formatAsNewsElement(result))
    return formattedNews
}

export async function getNews(db: Pool): Promise<newsElement[] | undefined>{
    const news = await db.query('SELECT * FROM news WHERE date <= $1 ORDER BY date DESC', [getCurrentDateShort()])
    if (!news || news.rowCount == 0) { return undefined }
    const formattedNews = news.rows.map((result) => formatAsNewsElement(result))
    return formattedNews
}

export async function getPinnedNews(db: Pool): Promise<newsElement[] | undefined>{
    const news = await db.query('SELECT * FROM news WHERE pin = true AND date <= $1 ORDER BY date DESC LIMIT 4', [getCurrentDateShort()])
    if (!news || news.rowCount == 0) { return undefined }
    const formattedNews = news.rows.map((result) => formatAsNewsElement(result))
    return formattedNews
}

export async function getNewsData(db: Pool, id: number | string): Promise<newsElement | undefined>{
    const newsData = await db.query('SELECT * FROM news WHERE id = $1 AND date <= $2 LIMIT 1', [id, getCurrentDateShort()])
    if (!newsData || newsData.rowCount == 0) { return undefined }
    const formattedNewsData = formatAsNewsElement(newsData.rows[0])
    return formattedNewsData
}

export function formatAsNewsElement(row: any): newsElement{
    return { id: row.id, title: row.title, description: row.description, date: row.date, pin: row.pin, image: row.image }
}