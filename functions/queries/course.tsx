import ADMcourseElement from "@/interfaces/ADMcourseElement";
import courseElement from "@/interfaces/courseElement";
import { Pool, QueryResult } from "pg";
import { getDateLong } from "../dates";
import { archiveSignupsByCourse } from "./signups";
import { ClickMeetingConference } from "@/interfaces/ClickMeetingConference";
import { ClickMeetingAttendeeURL } from "@/interfaces/ClickMeetingAttendeeURL";

const baseSelect = `SELECT
    "c"."id" AS "C_ID",
    "c"."date" AS "C_DATE",
    "c"."title" AS "C_TITLE",
    "c"."place" AS "C_PLACE",
    "c"."instructor" AS "C_INSTRUCTOR",
    "c"."note" AS "C_NOTE",
    "c"."price" AS "C_PRICE",
    "c"."span" AS "C_SPAN",
    "c"."slots" AS "C_SLOTS",
    "c"."available" AS "C_AVAILABLE",
    "c"."dateCreated" AS "C_DATECREATED",
    "c"."fileName" AS "C_FILENAME",
    "c"."customURL" AS "C_CUSTOMURL",
    "c"."permissionRequired" AS "C_PERMISSIONREQUIRED",
    "c"."webinar" as "C_WEBINAR",
    COALESCE(SUM(array_length("s"."attendees", 1)), 0) AS "C_SLOTSUSED"
    FROM "courses" "c"
    LEFT JOIN "signups" "s" ON "s"."courseID" = "c"."id" AND "s"."invalidated" = false AND "s"."archived" = false
`
const baseSelectArchive = baseSelect.replace(`"archived" = false`, `"archived" = true`)
const baseWhere = 'WHERE "c"."archived" = false'
const baseGrouping = 'GROUP BY "c"."id"'
const baseOrder = 'ORDER BY "c"."date"'

export async function uploadFile(db: Pool, id: string | number, file: Buffer, fileName: string): Promise<boolean>{
    const course = await db.query(`UPDATE "courses" "c" SET "file" = $1, "fileName" = $2 ${baseWhere} AND "id" = $3`, [file, fileName, id])
    if (!course?.rowCount) { return false }
    return true
}

export async function deleteFile(db: Pool, id: string | number): Promise<boolean>{
    const course = await db.query(`UPDATE "courses" "c" SET "file" = NULL, "fileName" = NULL ${baseWhere} AND "id" = $1`, [id])
    if (!course?.rowCount) { return false }
    return true
}

export async function createCourse(db: Pool, date: string, title: string, place: string, instructor: string, note: string | undefined = undefined, price: string, span: string, slots: string, customURL: string | undefined = undefined): Promise<ADMcourseElement | undefined>{
    const course = await db.query('INSERT INTO "courses"("date", "title", "place", "instructor", "note", "price", "span", "slots", "available", "dateCreated", "customURL") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10) RETURNING "id"', [date, title, place, instructor, note, price, span, slots, getDateLong(), customURL])
    if (!course?.rowCount) { return undefined }
    return await ADMgetCourse(db, course.rows[0].id)
}

export async function deleteCourse(db: Pool, id: string): Promise<boolean>{
    const course = await db.query(`DELETE FROM "courses" "c" ${baseWhere} AND "id" = $1`, [id])
    if (!course?.rowCount) { return false }
    return true 
}

export async function updateCourse(db: Pool, id: string, date: string, title: string, place: string, instructor: string, note: string | undefined = undefined, price: string, span: string, customURL: string | undefined = undefined, slots: string): Promise<ADMcourseElement | undefined>{
    const course = await db.query('UPDATE "courses" "c" SET "date" = $1, "title" = $2, "place" = $3, "instructor" = $4, "note" = $5, "price" = $6, "span" = $7, "slots" = $8, "customURL" = $9 WHERE "id" = $10 AND "archived" = false', [date, title, place, instructor, note, price, span, slots, customURL, id])
    if (!course?.rowCount) { return undefined }
    return await ADMgetCourse(db, id)
}

export async function getUpcomingCourses(db: Pool): Promise<ADMcourseElement[] | undefined> {
    const courses = await db.query(`${baseSelect} ${baseWhere} AND "c"."date" < $1 ${baseGrouping} ${baseOrder}`, [getDateLong(new Date((new Date).getTime() + 172800000))])
    if (!courses?.rowCount) { return undefined }
    return courses.rows.map(result => formatAsADMCourseElement(result))
}

export async function getUpcomingCourses1day(db: Pool): Promise<ADMcourseElement[] | undefined> {
    const courses = await db.query(`${baseSelect} ${baseWhere} AND "c"."date" < $1 ${baseGrouping} ${baseOrder}`, [getDateLong(new Date((new Date).getTime() + 86400000))])
    if (!courses?.rowCount) { return undefined }
    return courses.rows.map(result => formatAsADMCourseElement(result))
}


async function getAllCoursesRecords(db: Pool, archived: boolean = false): Promise<QueryResult>{
    return await db.query(`${archived ? baseSelectArchive : baseSelect} WHERE "c"."archived" = $1 ${baseGrouping} ${baseOrder}`, [archived])
}

async function getCourseRecord(db: Pool, id: string | number, archived: boolean = false): Promise<QueryResult>{
    return await db.query(`${archived ? baseSelectArchive : baseSelect} WHERE "c"."archived" = $1 AND "c"."id" = $2 ${baseGrouping} LIMIT 1`, [archived, id])
}
export async function getCourses(db: Pool): Promise<courseElement[] | undefined>{
    const courses = await getAllCoursesRecords(db)
    if (!courses?.rowCount) { return undefined }
    return courses.rows.map(result => formatAsCourseElement(result))
}

export async function getRecentCourses(db: Pool): Promise<courseElement[] | undefined>{
    const courses = await db.query(`${baseSelect} ${baseWhere} ${baseGrouping} ORDER BY "c"."dateCreated" DESC LIMIT 4`)
    if (!courses?.rowCount) { return undefined }
    return courses.rows.map(result => formatAsCourseElement(result))
}

export async function getCourse(db: Pool, id: number | string): Promise<courseElement | undefined>{
    const course = await getCourseRecord(db, id)
    if (!course?.rowCount) { return undefined }
    return formatAsCourseElement(course.rows[0])
}

export async function getCourseFile(db: Pool, id: number | string): Promise<Buffer | undefined>{
    const course = await db.query(`SELECT "file" FROM "courses" "c" ${baseWhere} AND id = $1 LIMIT 1`, [id])
    if (!course?.rowCount) { return undefined }
    return course.rows[0].file
}

export async function ADMgetArchivedCourse(db: Pool, id: number | string): Promise<ADMcourseElement | undefined>{
    const course = await getCourseRecord(db, id, true)
    if (!course?.rowCount) { return undefined }
    return formatAsADMCourseElement(course.rows[0])
}

export async function ADMgetCourse(db: Pool, id: number | string): Promise<ADMcourseElement | undefined>{
    const course = await getCourseRecord(db, id)
    if (!course?.rowCount) { return undefined }
    return formatAsADMCourseElement(course.rows[0])
}

export async function ADMgetArchivedCourses(db: Pool): Promise<ADMcourseElement[] | undefined>{
    const courses = await getAllCoursesRecords(db, true)
    if (!courses?.rowCount) { return undefined }
    return courses.rows.map(result => formatAsADMCourseElement(result))
}

export async function ADMgetCourses(db: Pool): Promise<ADMcourseElement[] | undefined>{
    const courses = await getAllCoursesRecords(db)
    if (!courses?.rowCount) { return undefined }
    return courses.rows.map(result => formatAsADMCourseElement(result))
}

export async function ADMlockDueCourses(db: Pool): Promise<number>{
    const locked = await db.query('UPDATE "courses" SET "available" = false WHERE "date" <= $1 AND "available" = true AND "place" != $2', [getDateLong(new Date((new Date).getTime() + 86400000)), "Online"])
    const lockedOnline = await db.query('UPDATE "courses" SET "available" = false WHERE "date" <= $1 AND "available" = true AND "place" = $2', [getDateLong(new Date((new Date).getTime() + 43200000)), "Online"])
    return (locked.rowCount ?? 0) + (lockedOnline.rowCount ?? 0)
}

export async function ADMarchiveCourses(db: Pool): Promise<number[]>{
    const archived = await db.query(`UPDATE "courses" "c" SET "archived" = true ${baseWhere} AND "date" + ("span" * interval '1 minute') <= $1 RETURNING "id"`, [getDateLong()])
    if (!archived?.rowCount) { return [0,0] }
    const archivedSignups = (await Promise.all(archived.rows.map(async archivedCourse => {
        const course = await ADMgetArchivedCourse(db, archivedCourse.id)
        if (course){ return await archiveSignupsByCourse(db, course) }
        return 0
    }))).reduce((a, b) => a + b, 0);
    return [archived.rowCount, archivedSignups]
}

export async function addCourseWebinarExternalAttendees(db: Pool, id: number | string, attendees: ClickMeetingAttendeeURL[]){
    await db.query(`UPDATE "courses" SET "webinarExternalAttendees" = ARRAY_CAT("webinarExternalAttendees", $1) WHERE "id" = $2`, [attendees, id])
}

export async function addCourseWebinar(db: Pool, id: number | string, conference: ClickMeetingConference): Promise<boolean> {
    const result = await db.query(`UPDATE "courses" SET "webinar" = $1 WHERE "id" = $2`, [conference, id])
    if (!result?.rowCount) { return false }
    return true
}

export async function eraseCourseWebinar(db: Pool, id: number | string): Promise<boolean> {
    await db.query(`UPDATE "signups" SET "webinarURLs" = NULL WHERE "courseID" = $1`, [id])
    const result = await db.query(`UPDATE "courses" SET "webinar" = NULL, "webinarExternalAttendees" = NULL WHERE "id" = $1`, [id])
    if (!result?.rowCount) { return false }
    return true
}

export function formatAsCourseElement(row: any): courseElement{
    return { 
        id: row.C_ID, 
        date: row.C_DATE, 
        span: row.C_SPAN, 
        price: row.C_PRICE, 
        title: row.C_TITLE, 
        place: row.C_PLACE, 
        instructor: row.C_INSTRUCTOR, 
        note: row.C_NOTE, 
        slots: row.C_CUSTOMURL == undefined ? row.C_SLOTS : 0, 
        slotAvailable: row.C_CUSTOMURL == undefined ? (Number(row.C_SLOTSUSED) >= row.C_SLOTS || row.C_SLOTS == 0 ? false : true) : true,
        available: row.C_CUSTOMURL == undefined ? row.C_AVAILABLE : true, 
        dateCreated: row.C_DATECREATED, 
        fileName: row.C_FILENAME, 
        customURL: row.C_CUSTOMURL, 
        offers: undefined, 
        permissionRequired: row.C_PERMISSIONREQUIRED 
    }
}

export function formatAsADMCourseElement(row: any): ADMcourseElement{
    return { 
        id: row.C_ID, 
        date: row.C_DATE, 
        span: row.C_SPAN, 
        price: row.C_PRICE, 
        title: row.C_TITLE, 
        place: row.C_PLACE, 
        instructor: row.C_INSTRUCTOR, 
        note: row.C_NOTE, 
        slots: row.C_CUSTOMURL == undefined ? row.C_SLOTS : 0, 
        slotsUsed: row.C_CUSTOMURL == undefined ? Number(row.C_SLOTSUSED) : 0,
        available: row.C_CUSTOMURL == undefined ? row.C_AVAILABLE : true,
        dateCreated: row.C_DATECREATED, 
        fileName: row.C_FILENAME, 
        customURL: row.C_CUSTOMURL, 
        permissionRequired: row.C_PERMISSIONREQUIRED,
        webinar: row.C_WEBINAR
    }
}