import ADMcourseElement from "@/interfaces/ADMcourseElement";
import courseElement from "@/interfaces/courseElement";
import { Pool } from "pg";
import getSlotAvailability from "../getSlotAvailability";
import getCourseSignupCount from "../getCourseSignupCount";
import { getDateLong } from "../dates";

export async function createCourse(db: Pool, date: string, title: string, place: string, instructor: string, note: string | undefined = undefined, price: string, span: string, slots: string): Promise<ADMcourseElement | undefined>{
    const course = await db.query('INSERT INTO "courses"("date", "title", "place", "instructor", "note", "price", "span", "slots", "available", "dateCreated") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9) RETURNING *', [date, title, place, instructor, note, price, span, slots, getDateLong()])
    if (!course || course.rowCount == 0) { return undefined }
    return await formatAsADMCourseElement(course.rows[0], db)
}

export async function deleteCourse(db: Pool, id: string): Promise<boolean>{
    const course = await db.query('DELETE FROM "courses" WHERE "id" = $1', [id])
    if (!course || course.rowCount == 0) { return false }
    return true 
}

export async function updateCourse(db: Pool, id: string, date: string, title: string, place: string, instructor: string, note: string | undefined = undefined, price: string, span: string, slots: string): Promise<ADMcourseElement | undefined>{
    const course = await db.query('UPDATE "courses" SET "date" = $1, "title" = $2, "place" = $3, "instructor" = $4, "note" = $5, "price" = $6, "span" = $7, "slots" = $8 WHERE "id" = $9 RETURNING *', [date, title, place, instructor, note, price, span, slots, id])
    if (!course || course.rowCount == 0) { return undefined }
    return await formatAsADMCourseElement(course.rows[0], db)
}

export async function getCourses(db: Pool): Promise<courseElement[] | undefined>{
    const courses = await db.query('SELECT * FROM "courses" WHERE date > $1 ORDER BY date', [getDateLong()])
    if (!courses || courses.rowCount == 0) { return undefined }
    const coursesFormatted: courseElement[] = await Promise.all(courses.rows.map(async (result) => await formatAsCourseElement(result, db)))
    return coursesFormatted
}

export async function getRecentCourses(db: Pool): Promise<courseElement[] | undefined>{
    const courses = await db.query('SELECT * FROM courses WHERE date > $1 ORDER BY "dateCreated" DESC LIMIT 4', [getDateLong()])
    if (!courses || courses.rowCount == 0) { return undefined }
    const coursesFormatted: courseElement[] = await Promise.all(courses.rows.map(async (result) => await formatAsCourseElement(result, db)))
    return coursesFormatted
}

export async function getCourse(db: Pool, id: number | string): Promise<courseElement | undefined>{
    const courses = await db.query('SELECT * FROM "courses" WHERE date > $1 AND id = $2 LIMIT 1', [getDateLong(), id])
    if (!courses || courses.rowCount == 0) { return undefined}
    const courseFormatted: courseElement = await formatAsCourseElement(courses.rows[0], db)
    return courseFormatted
}

export async function ADMgetCourse(db: Pool, id: number | string): Promise<ADMcourseElement | undefined>{
    const course = await db.query('SELECT * FROM "courses" WHERE date > $1 AND id = $2 LIMIT 1', [getDateLong(), id])
    if (!course || course.rowCount == 0) { return undefined }
    const courseFormatted: ADMcourseElement = await formatAsADMCourseElement(course.rows[0], db)
    return courseFormatted
}


export async function ADMgetCourses(db: Pool): Promise<ADMcourseElement[] | undefined>{
    const courses = await db.query('SELECT * FROM "courses" WHERE date > $1 ORDER BY date', [getDateLong()])
    if (!courses || courses.rowCount == 0) { return undefined }
    const coursesFormatted: ADMcourseElement[] = await Promise.all(courses.rows.map(async (result) => await formatAsADMCourseElement(result, db)))
    return coursesFormatted
}

export async function formatAsCourseElement(row: any, db: Pool): Promise<courseElement>{
    return { id: row.id, date: row.date, span: row.span, price: row.price, title: row.title, place: row.place, instructor: row.instructor, note: row.note, slots: row.slots, slotAvailable: await getSlotAvailability(db, row.id, row.slots), available: row.available, dateCreated: row.dateCreated }
}

export async function formatAsADMCourseElement(row: any, db: Pool): Promise<ADMcourseElement>{
    return { id: row.id, date: row.date, span: row.span, price: row.price, title: row.title, place: row.place, instructor: row.instructor, note: row.note, slots: row.slots, slotsUsed: await getCourseSignupCount(db, row.id), available: row.available, dateCreated: row.dateCreated }
}