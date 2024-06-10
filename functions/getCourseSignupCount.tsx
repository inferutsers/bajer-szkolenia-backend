import { Pool } from "pg"

export default async function getCourseSignupCount(db: Pool, courseID: String): Promise<Number>{
    const courseSignups = await db.query('SELECT "id" FROM "signups" WHERE "courseID" = $1', [courseID])
    const signupAmount = courseSignups.rowCount != null ? courseSignups.rowCount : 0
    return signupAmount
}