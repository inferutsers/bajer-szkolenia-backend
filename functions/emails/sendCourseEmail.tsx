import { Pool } from "pg";
import fs from 'fs'
import mailStructure from "@/interfaces/mailStructure";
import sendBulkBCCEmail from "./processor/sendBulkBCCEmail";
import ADMcourseElement from "@/interfaces/ADMcourseElement";
import mailFormatAsCourseEmail from "../formattings/mailFormatAsCourseEmail";
import { bulkEmailReceiver } from "@/interfaces/newsletterReceiver";

export default async function sendCourseEmail(db: Pool, course: ADMcourseElement, subject: string, message: string, receivers: bulkEmailReceiver[]): Promise<{mailSent: boolean}>{
    const mailContentHTML = mailFormatAsCourseEmail(fs.readFileSync("/home/ubuntu/backend/templates/courseEmail.html", 'utf-8'), message, course)
    const mailContentRaw = fs.readFileSync("/home/ubuntu/backend/templates/courseEmail.txt", 'utf-8')
    const mailSent: mailStructure = await sendBulkBCCEmail(receivers.map((result) => (result.email)), subject, mailContentRaw, mailContentHTML)
    if(mailSent.failure == false) {
        await db.query('UPDATE signups SET "emailsSent" = ARRAY_APPEND("emailsSent", $1) WHERE "id" = ANY($2)', [mailSent, receivers.map((result) => (result.id))])
        return {mailSent: true}
    } else {
        return {mailSent: false}
    }
}