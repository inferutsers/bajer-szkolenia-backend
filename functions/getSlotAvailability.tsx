import { Pool } from "pg"
import getCourseSignupCount from "./getCourseSignupCount"

export default async function getSlotAvailability(db: Pool, id: string, slots: number): Promise<boolean>{
    const courseSignupsAmount = await getCourseSignupCount(db, id)
    if (courseSignupsAmount < slots) { return true }
    return false
}