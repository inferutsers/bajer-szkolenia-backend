import { Pool } from "pg"

export default async function getOfferDate(db: Pool, id: Number): Promise<Date>{
    const offerArray = await db.query('SELECT "date" from "offers" WHERE "id" = $1 LIMIT 1', [id])
    if (!offerArray || offerArray.rowCount == 0) { return new Date }
    return offerArray.rows[0].date
}