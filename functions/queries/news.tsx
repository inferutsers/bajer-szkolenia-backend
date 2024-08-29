import newsElement from "@/interfaces/newsElement";
import { Pool } from "pg";
import { getDateShort } from "../dates";

export async function createNews(db: Pool, title: string, description: string, date: string, pin: string, imgbuffer: Buffer | null): Promise<newsElement | undefined>{
    const news = await db.query('INSERT INTO "news"("title", "description", "date", "pin", "image") VALUES ($1, $2, $3, $4, $5) RETURNING *', [title, description, date, pin, imgbuffer])
    if (!news || news.rowCount == 0) { return undefined }
    return formatAsNewsElement(news.rows[0])
}

export async function deleteNews(db: Pool, id: string): Promise<boolean>{
    const news = await db.query('DELETE FROM "news" WHERE "id" = $1', [id])
    if (!news || news.rowCount == 0) { return false }
    return true
}

export async function updateNews(db: Pool, id: string, title: string, description: string, date: string, pin: string, imgbuffer: Buffer | null): Promise<newsElement | undefined>{
    const news = await db.query('UPDATE "news" SET "title" = $1, "description" = $2, "date" = $3, "pin" = $4, "image" = $5 WHERE "id" = $6 RETURNING *', [title, description, date, pin, imgbuffer, id])
    if (!news || news.rowCount == 0) { return undefined }
    return formatAsNewsElement(news.rows[0])
}

export async function ADMgetNews(db: Pool): Promise<newsElement[] | undefined>{
    const news = await db.query('SELECT * FROM news ORDER BY date DESC')
    if (!news || news.rowCount == 0) { return undefined }
    const formattedNews = news.rows.map((result) => formatAsNewsElement(result))
    return formattedNews
}

export async function getNews(db: Pool): Promise<newsElement[] | undefined>{
    const news = await db.query('SELECT * FROM news WHERE date <= $1 ORDER BY date DESC', [getDateShort()])
    if (!news || news.rowCount == 0) { return undefined }
    const formattedNews = news.rows.map((result) => formatAsNewsElement(result))
    return formattedNews
}

export async function getPinnedNews(db: Pool): Promise<newsElement[] | undefined>{
    const news = await db.query('SELECT * FROM news WHERE pin = true AND date <= $1 ORDER BY date DESC LIMIT 4', [getDateShort()])
    if (!news || news.rowCount == 0) { return undefined }
    const formattedNews = news.rows.map((result) => formatAsNewsElement(result))
    return formattedNews
}

export async function getNewsData(db: Pool, id: number | string): Promise<newsElement | undefined>{
    const newsData = await db.query('SELECT * FROM news WHERE id = $1 AND date <= $2 LIMIT 1', [id, getDateShort()])
    if (!newsData || newsData.rowCount == 0) { return undefined }
    const formattedNewsData = formatAsNewsElement(newsData.rows[0])
    return formattedNewsData
}

export async function getAllNewsData(db: Pool, id: number | string): Promise<newsElement | undefined>{
    const newsData = await db.query('SELECT * FROM news WHERE id = $1 LIMIT 1', [id])
    if (!newsData || newsData.rowCount == 0) { return undefined }
    const formattedNewsData = formatAsNewsElement(newsData.rows[0])
    return formattedNewsData
}

export function formatAsNewsElement(row: any): newsElement{
    return { id: row.id, title: row.title, description: row.description, date: row.date, pin: row.pin, image: row.image }
}