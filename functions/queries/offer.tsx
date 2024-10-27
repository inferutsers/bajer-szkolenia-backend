import { Pool } from "pg";
import offerElement from "@/interfaces/offerElement";
import { getDateLong } from "../dates";

export async function uploadFile(db: Pool, id: string | number, file: Buffer, fileName: string): Promise<boolean>{
    const course = await db.query('UPDATE "offers" SET "file" = $1, "fileName" = $2 WHERE "id" = $3', [file, fileName, id])
    if (!course || course.rowCount == 0) { return false }
    return true
}

export async function deleteFile(db: Pool, id: string | number): Promise<boolean>{
    const course = await db.query('UPDATE "offers" SET "file" = NULL, "fileName" = NULL WHERE "id" = $1', [id])
    if (!course || course.rowCount == 0) { return false }
    return true
}

export async function createOffer(db: Pool, name: string, note: string | undefined = undefined, price: string, courses: number[]): Promise<offerElement | undefined> {
    const offer = await db.query('INSERT INTO "offers"("name", "note", "price", "courses", "dateCreated") VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, note, price, courses, getDateLong()])
    if (!offer || offer.rowCount == 0) { return undefined }
    return await formatAsOfferElement(offer.rows[0], db, true)
}

export async function deleteOffer(db: Pool, id: string): Promise<boolean>{
    const offer = await db.query('DELETE FROM "offers" WHERE "id" = $1', [id])
    if (!offer || offer.rowCount == 0) { return false }
    return true 
}

export async function updateOffer(db: Pool, id: string, name: string, note: string | undefined = undefined, price: string): Promise<offerElement | undefined> {
    const offer = await db.query('UPDATE "offers" SET "name" = $1, "note" = $2, "price" = $3 WHERE "id" = $4 RETURNING *', [name, note, price, id])
    if (!offer || offer.rowCount == 0) { return undefined }
    return await formatAsOfferElement(offer.rows[0], db, true)
}

export async function getOffer(db: Pool, id: number | string): Promise<offerElement | undefined>{
    const offer = await db.query('SELECT "id", "name", "courses", "price", "available", "note", "dateCreated", "fileName" FROM "offers" WHERE "id" = $1 LIMIT 1', [id])
    if (!offer || offer.rowCount == 0) { return undefined }
    return await formatAsOfferElement(offer.rows[0], db, true) 
}

export async function getOffers(db: Pool): Promise<offerElement[] | undefined>{
    const offers = await db.query('SELECT "id", "name", "courses", "price", "available", "note", "dateCreated", "fileName" FROM "offers" ORDER BY "dateCreated"')
    if (!offers || offers.rowCount == 0) { return undefined }
    return await Promise.all(offers.rows.map(async offer => await formatAsOfferElement(offer, db, true)))
}

export async function getCourseOffers(db: Pool, courseID: string | number): Promise<offerElement[] | undefined>{
    const offers = await db.query('SELECT "id", "name", "courses", "price", "available", "note", "dateCreated", "fileName" FROM "offers" WHERE "courses" @> $1 ORDER BY "dateCreated"', [[courseID]])
    if (!offers || offers.rowCount == 0) { return undefined }
    return await Promise.all(offers.rows.map(async offer => await formatAsOfferElement(offer, db, false)))
}

export async function getOfferFile(db: Pool, id: number | string): Promise<Buffer | undefined>{
    const course = await db.query('SELECT "file" FROM "offers" WHERE id = $1 LIMIT 1', [id])
    if (!course || course.rowCount == 0) { return undefined }
    return course.rows[0].file
}

export async function formatAsOfferElement(row: any, db: Pool, withCourses: boolean): Promise<offerElement>{
    return { id: row.id, name: row.name, courses: undefined, price: row.price, note: row.note, available: row.available, dateCreated: row.dateCreated, fileName: row.fileName}
}