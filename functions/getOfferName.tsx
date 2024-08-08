import { Pool } from "pg"

export default async function getOfferName(db: Pool, id: Number): Promise<string>{
    const courseArray = await db.query('SELECT "name" from "offers" WHERE "id" = $1 LIMIT 1', [id])
    if (!courseArray || courseArray.rowCount == 0) { return "nieznany pakiet" }
    return courseArray.rows[0].name
}