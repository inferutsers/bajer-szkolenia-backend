import ADMcourseElement from "@/interfaces/ADMcourseElement";
import courseElement from "@/interfaces/courseElement";
import { Pool } from "pg";
import getSlotAvailability from "../getSlotAvailability";
import getCourseSignupCount from "../getCourseSignupCount";
import { getCurrentDateLong } from "../dates";

export async function getCourses(db: Pool): Promise<courseElement[] | undefined>{
    const courses = await db.query('SELECT * FROM "courses" WHERE date > $1 ORDER BY date', [getCurrentDateLong()])
    if (!courses || courses.rowCount == 0) { return undefined }
    const coursesFormatted: courseElement[] = await Promise.all(courses.rows.map(async (result) => await formatAsCourseElement(result, db)))
    return coursesFormatted
}

export async function getRecentCourses(db: Pool): Promise<courseElement[] | undefined>{
    const courses = await db.query('SELECT * FROM courses WHERE date > $1 ORDER BY date DESC LIMIT 4', [getCurrentDateLong()])
    if (!courses || courses.rowCount == 0) { return undefined }
    const coursesFormatted: courseElement[] = await Promise.all(courses.rows.map(async (result) => await formatAsCourseElement(result, db)))
    return coursesFormatted
}

export async function getCourse(db: Pool, id: number | string): Promise<courseElement | undefined>{
    const courses = await db.query('SELECT * FROM "courses" WHERE date > $1 AND id = $2 LIMIT 1', [getCurrentDateLong(), id])
    if (!courses || courses.rowCount == 0) { return undefined}
    const courseFormatted: courseElement = await formatAsCourseElement(courses.rows[0], db)
    return courseFormatted
}

export async function ADMgetCourse(db: Pool, id: number | string): Promise<ADMcourseElement | undefined>{
    const course = await db.query('SELECT * FROM "courses" WHERE date > $1 AND id = $2 LIMIT 1', [getCurrentDateLong(), id])
    if (!course || course.rowCount == 0) { return undefined }
    const courseFormatted: ADMcourseElement = await formatAsADMCourseElement(course.rows[0], db)
    return courseFormatted
}


export async function ADMgetCourses(db: Pool): Promise<ADMcourseElement[] | undefined>{
    const courses = await db.query('SELECT * FROM "courses" WHERE date > $1 ORDER BY date', [getCurrentDateLong()])
    if (!courses || courses.rowCount == 0) { return undefined }
    const coursesFormatted: ADMcourseElement[] = await Promise.all(courses.rows.map(async (result) => await formatAsADMCourseElement(result, db)))
    return coursesFormatted
}

export async function formatAsCourseElement(row: any, db: Pool): Promise<courseElement>{
    return { id: row.id, date: row.date, span: row.span, price: row.price, title: row.title, place: row.place, instructor: row.instructor, note: row.note, slots: row.slots, slotAvailable: await getSlotAvailability(db, row.id, row.slots), available: row.available }
}

export async function formatAsADMCourseElement(row: any, db: Pool): Promise<ADMcourseElement>{
    return { id: row.id, date: row.date, span: row.span, price: row.price, title: row.title, place: row.place, instructor: row.instructor, note: row.note, slots: row.slots, slotsUsed: await getCourseSignupCount(db, row.id), available: row.available }
}