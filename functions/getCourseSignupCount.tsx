import { Pool } from "pg"

export default async function getCourseSignupCount(db: Pool, courseID: String): Promise<number>{
    const courseSignups = await db.query('SELECT "attendees" FROM "signups" WHERE "courseID" = $1 AND "invalidated" = false', [courseID])
    const signupAmount = courseSignups.rowCount != null ? (courseSignups.rows.map((item) => (item.attendees.length)) as number[]).reduce(function(pv, cv) { return pv + cv; }, 0) : 0
    return signupAmount
}