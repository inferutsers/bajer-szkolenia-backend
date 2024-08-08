import { Pool } from "pg"

export default async function getOfferPrice(db: Pool, id: Number): Promise<number>{
    const offerArray = await db.query('SELECT "price" from "offers" WHERE "id" = $1 LIMIT 1', [id])
    if (!offerArray || offerArray.rowCount == 0) { return -1 }
    return offerArray.rows[0].price
}