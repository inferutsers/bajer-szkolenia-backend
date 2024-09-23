import { Pool } from "pg"

export default async function getCourseDate(db: Pool, id: Number): Promise<Date>{
    const courseArray = await db.query('SELECT "date" from "courses" WHERE "id" = $1 LIMIT 1', [id])
    if (!courseArray || courseArray.rowCount == 0) { return new Date }
    return courseArray.rows[0].date
}