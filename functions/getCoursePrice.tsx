import { Pool } from "pg"

export default async function getCoursePrice(db: Pool, id: Number): Promise<number>{
    const courseArray = await db.query('SELECT "price" from "courses" WHERE "id" = $1 LIMIT 1', [id])
    if (!courseArray || courseArray.rowCount == 0) { return -1 }
    return courseArray.rows[0].price
}