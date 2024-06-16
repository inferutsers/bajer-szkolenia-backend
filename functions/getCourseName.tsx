import { Pool } from "pg"

export default async function getCourseName(db: Pool, id: Number): Promise<string>{
    const courseArray = await db.query('SELECT "title" from "courses" WHERE "id" = $1 LIMIT 1', [id])
    if (!courseArray || courseArray.rowCount == 0) { return "nieznane szkolenie" }
    return courseArray.rows[0].title
}