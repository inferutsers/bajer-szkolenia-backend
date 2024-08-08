import { Pool } from "pg"
import { getCourseSignupsCount } from "./getCourseSignups"

export default async function getSlotAvailability(db: Pool, id: string, slots: number): Promise<boolean>{
    const courseSignupsAmount = await getCourseSignupsCount(db, id)
    if (courseSignupsAmount < slots) { return true }
    return false
}