import ADMcourseElement from "@/interfaces/ADMcourseElement";
import courseElement from "@/interfaces/courseElement";
import { Pool } from "pg";
import getSlotAvailability from "../getSlotAvailability";
import { getDateLong } from "../dates";
import { getCourseOffers } from "./offer";
import { getCourseSignupsCount } from "../getCourseSignups";
import { archiveSignupsByCourse } from "./signups";

export async function uploadFile(db: Pool, id: string | number, file: Buffer, fileName: string): Promise<boolean>{
    const course = await db.query('UPDATE "courses" SET "file" = $1, "fileName" = $2 WHERE "id" = $3 AND "archived" = false', [file, fileName, id])
    if (!course || course.rowCount == 0) { return false }
    return true
}

export async function deleteFile(db: Pool, id: string | number): Promise<boolean>{
    const course = await db.query('UPDATE "courses" SET "file" = NULL, "fileName" = NULL WHERE "id" = $1 AND "archived" = false', [id])
    if (!course || course.rowCount == 0) { return false }
    return true
}

export async function createCourse(db: Pool, date: string, title: string, place: string, instructor: string, note: string | undefined = undefined, price: string, span: string, slots: string, customURL: string | undefined = undefined): Promise<ADMcourseElement | undefined>{
    const course = await db.query('INSERT INTO "courses"("date", "title", "place", "instructor", "note", "price", "span", "slots", "available", "dateCreated", "customURL") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10) RETURNING *', [date, title, place, instructor, note, price, span, slots, getDateLong(), customURL])
    if (!course || course.rowCount == 0) { return undefined }
    return await formatAsADMCourseElement(course.rows[0], db)
}

export async function deleteCourse(db: Pool, id: string): Promise<boolean>{
    const course = await db.query('DELETE FROM "courses" WHERE "id" = $1 AND "archived" = false', [id])
    if (!course || course.rowCount == 0) { return false }
    return true 
}

export async function updateCourse(db: Pool, id: string, date: string, title: string, place: string, instructor: string, note: string | undefined = undefined, price: string, span: string, customURL: string | undefined = undefined, slots: string): Promise<ADMcourseElement | undefined>{
    const course = await db.query('UPDATE "courses" SET "date" = $1, "title" = $2, "place" = $3, "instructor" = $4, "note" = $5, "price" = $6, "span" = $7, "slots" = $8, "customURL" = $9 WHERE "id" = $10 AND "archived" = false RETURNING *', [date, title, place, instructor, note, price, span, slots, customURL, id])
    if (!course || course.rowCount == 0) { return undefined }
    return await formatAsADMCourseElement(course.rows[0], db)
}

export async function getUpcomingCourses(db: Pool): Promise<courseElement[] | undefined> {
    const courses = await db.query('SELECT "id", "date", "title", "place", "instructor", "note", "price", "span", "slots", "available", "dateCreated", "fileName", "customURL" FROM "courses" WHERE "archived" = false AND date < $1 AND title != $2 ORDER BY date', [getDateLong(new Date((new Date).getTime() + 172800000)), "--##"])
    if (!courses || courses.rowCount == 0) { return undefined }
    const coursesFormatted: courseElement[] = await Promise.all(courses.rows.map(async (result) => await formatAsCourseElement(result, db)))
    return coursesFormatted
}

export async function getCourses(db: Pool): Promise<courseElement[] | undefined>{
    const courses = await db.query('SELECT "id", "date", "title", "place", "instructor", "note", "price", "span", "slots", "available", "dateCreated", "fileName", "customURL" FROM "courses" WHERE "archived" = false AND title != $1 ORDER BY date', ["--##"])
    if (!courses || courses.rowCount == 0) { return undefined }
    const coursesFormatted: courseElement[] = await Promise.all(courses.rows.map(async (result) => await formatAsCourseElement(result, db)))
    return coursesFormatted
}

export async function getRecentCourses(db: Pool): Promise<courseElement[] | undefined>{
    const courses = await db.query('SELECT "id", "date", "title", "place", "instructor", "note", "price", "span", "slots", "available", "dateCreated", "fileName", "customURL", "permissionRequired" FROM courses WHERE "archived" = false AND title != $1 ORDER BY "dateCreated" DESC LIMIT 4', ["--##"])
    if (!courses || courses.rowCount == 0) { return undefined }
    const coursesFormatted: courseElement[] = await Promise.all(courses.rows.map(async (result) => await formatAsCourseElement(result, db)))
    return coursesFormatted
}

export async function getCourse(db: Pool, id: number | string, withOffers: boolean = true): Promise<courseElement | undefined>{
    const courses = await db.query('SELECT "id", "date", "title", "place", "instructor", "note", "price", "span", "slots", "available", "dateCreated", "fileName", "customURL", "permissionRequired" FROM "courses" WHERE "archived" = false AND id = $1 LIMIT 1', [id])
    if (!courses || courses.rowCount == 0) { return undefined}
    const courseFormatted: courseElement = await formatAsCourseElement(courses.rows[0], db, withOffers)
    return courseFormatted
}

export async function getCourseFile(db: Pool, id: number | string): Promise<Buffer | undefined>{
    const course = await db.query('SELECT "file" FROM "courses" WHERE "archived" = false AND id = $1 LIMIT 1', [id])
    if (!course || course.rowCount == 0) { return undefined }
    return course.rows[0].file
}

export async function ADMgetCourse(db: Pool, id: number | string): Promise<ADMcourseElement | undefined>{
    const course = await db.query('SELECT "id", "date", "title", "place", "instructor", "note", "price", "span", "slots", "available", "dateCreated", "fileName", "customURL", "permissionRequired" FROM "courses" WHERE "archived" = false AND id = $1 LIMIT 1', [id])
    if (!course || course.rowCount == 0) { return undefined }
    const courseFormatted: ADMcourseElement = await formatAsADMCourseElement(course.rows[0], db)
    return courseFormatted
}

export async function ADMgetArchivedCourses(db: Pool): Promise<ADMcourseElement[] | undefined>{
    const courses = await db.query('SELECT "id", "date", "title", "place", "instructor", "note", "price", "span", "slots", "available", "dateCreated", "fileName", "customURL", "permissionRequired" FROM "courses" WHERE "archived" = true AND title != $1 ORDER BY date', ["--##"])
    if (!courses || courses.rowCount == 0) { return undefined }
    const coursesFormatted: ADMcourseElement[] = await Promise.all(courses.rows.map(async (result) => await formatAsADMCourseElement(result, db)))
    return coursesFormatted
}

export async function ADMgetCourses(db: Pool): Promise<ADMcourseElement[] | undefined>{
    const courses = await db.query('SELECT "id", "date", "title", "place", "instructor", "note", "price", "span", "slots", "available", "dateCreated", "fileName", "customURL", "permissionRequired" FROM "courses" WHERE "archived" = false AND title != $1 ORDER BY date', ["--##"])
    if (!courses || courses.rowCount == 0) { return undefined }
    const coursesFormatted: ADMcourseElement[] = await Promise.all(courses.rows.map(async (result) => await formatAsADMCourseElement(result, db)))
    return coursesFormatted
}

export async function ADMlockDueCourses(db: Pool): Promise<number>{
    const locked = await db.query('UPDATE "courses" SET "available" = false WHERE "date" <= $1 AND "available" = true AND "place" != $2', [getDateLong(new Date((new Date).getTime() + 86400000)), "Online"])
    const lockedOnline = await db.query('UPDATE "courses" SET "available" = false WHERE "date" <= $1 AND "available" = true AND "place" = $2', [getDateLong(new Date((new Date).getTime() + 43200000)), "Online"])
    return (locked.rowCount ? locked.rowCount : 0) + (lockedOnline.rowCount ? lockedOnline.rowCount : 0)
}

export async function ADMarchiveCourses(db: Pool): Promise<number[]>{
    const archived = await db.query('UPDATE "courses" SET "archived" = true WHERE "date" <= $1 AND "archived" = false RETURNING "id"', [getDateLong()])
    if (!archived || archived.rowCount == 0) { return [0,0] }
    const archivedSignups = (await Promise.all(archived.rows.map(async course => {
        return await archiveSignupsByCourse(db, course.id)
    }))).reduce((a, b) => a + b, 0);
    return [archived.rowCount!, archivedSignups]
}

export async function formatAsCourseElement(row: any, db: Pool, withOffers: boolean = true): Promise<courseElement>{
    return { id: row.id, date: row.date, span: row.span, price: row.price, title: row.title, place: row.place, instructor: row.instructor, note: row.note, slots: row.customURL == undefined ? row.slots : 0, slotAvailable: row.customURL == undefined ? (await getSlotAvailability(db, row.id, row.slots)) : true, available: row.customURL == undefined ? row.available : true, dateCreated: row.dateCreated, fileName: row.fileName, customURL: row.customURL, offers: withOffers ? (await getCourseOffers(db, row.id)) : undefined, permissionRequired: row.permissionRequired }
}

export async function formatAsADMCourseElement(row: any, db: Pool): Promise<ADMcourseElement>{
    return { id: row.id, date: row.date, span: row.span, price: row.price, title: row.title, place: row.place, instructor: row.instructor, note: row.note, slots: row.customURL == undefined ? row.slots : 0, slotsUsed: row.customURL == undefined ? (await getCourseSignupsCount(db, row.id)) : 0, available: row.customURL == undefined ? row.available : true, dateCreated: row.dateCreated, fileName: row.fileName, customURL: row.customURL, permissionRequired: row.permissionRequired }
}