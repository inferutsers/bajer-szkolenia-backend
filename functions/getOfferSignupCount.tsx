import { Pool } from "pg"

export default async function getOfferSignupCount(db: Pool, offerID: String | number): Promise<number>{
    const courseSignups = await db.query('SELECT "attendees" FROM "signups" WHERE "offerID" = $1 AND "invalidated" = false', [offerID])
    const signupAmount = courseSignups.rowCount != null ? (courseSignups.rows.map((item) => (item.attendees.length)) as number[]).reduce(function(pv, cv) { return pv + cv; }, 0) : 0
    return signupAmount
}