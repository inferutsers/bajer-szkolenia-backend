import { Pool } from "pg"
import { getCourse } from "./queries/course"
import courseElement from "@/interfaces/courseElement"

export default async function getOfferCourses(db: Pool, coursesID: number[]): Promise<courseElement[] | undefined>{
    const courses = await Promise.all(coursesID.map(async courseID => {
        return (await getCourse(db, courseID, false))
    }))
    if (courses.includes(undefined)) { return undefined }
    return courses as courseElement[]
}