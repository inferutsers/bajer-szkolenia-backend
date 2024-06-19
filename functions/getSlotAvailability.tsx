import { Pool } from "pg"

export default async function getSlotAvailability(db: Pool, id: Number, slots: Number): Promise<boolean>{
    const courseSignupsArray = await db.query('SELECT "id" from "signups" WHERE "courseID" = $1 AND "invalidated" = false', [id])
    const courseSignupsAmount = courseSignupsArray.rowCount as Number
    if (courseSignupsAmount < slots) { return true }
    return false
}