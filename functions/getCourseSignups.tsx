import signupElement from "@/interfaces/signupElement"
import { Pool } from "pg"
import { getCourseOffers } from "./queries/offer"
import { formatAsSignupElement } from "./queries/signups"

export async function getCourseSignups(db: Pool, id: number | string): Promise<signupElement[] | undefined>{
    const courseOffers = await getCourseOffers(db, id)
    const courseOffersID: number[] = courseOffers ? (courseOffers.map(offer => offer.id )) : []
    const signups = await db.query('SELECT * FROM "signups" WHERE "invalidated" = false AND ("courseID" = $1 OR "offerID" = ANY($2)) ORDER BY "date" DESC', [id, courseOffersID])
    if (!signups || signups.rowCount == 0) { return undefined }
    const formattedSignups: signupElement[] = await Promise.all(signups.rows.map(async (result) => await formatAsSignupElement(result, db)))
    return formattedSignups
}

export async function getCourseSignupsCount(db: Pool, id: number | string): Promise<number>{
    const signups = await getCourseSignups(db, id)
    if (!signups) { return 0 }
    return (signups.map((item) => (item.attendees.length)) as number[]).reduce(function(pv, cv) { return pv + cv; }, 0)
}