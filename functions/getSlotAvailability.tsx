import { Pool } from "pg"

export async function getSlotAvailability(db: Pool, id: Number, slots: Number): Promise<boolean>{
    const courseSignupsArray = await db.query('SELECT "id" from "signups" WHERE "courseID" = $1', [id])
    const courseSignupsAmount = courseSignupsArray.rowCount as Number
    if (courseSignupsAmount < slots) { return true }
    return false
}