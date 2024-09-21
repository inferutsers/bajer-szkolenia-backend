import { Pool } from "pg";
import fs from 'fs'
import mailStructure from "@/interfaces/mailStructure";
import ADMcourseElement from "@/interfaces/ADMcourseElement";
import mailFormatAsCourseEmail from "../formattings/mailFormatAsCourseEmail";
import sendSingleEmail from "./processor/sendSingleEmail";
import signupElement from "@/interfaces/signupElement";

export default async function sendSignupEmail(db: Pool, course: ADMcourseElement, subject: string, message: string, signup: signupElement): Promise<{mailSent: boolean}>{
    const mailContentHTML = mailFormatAsCourseEmail(fs.readFileSync("/home/ubuntu/backend/templates/courseEmail.html", 'utf-8'), message, course)
    const mailContentRaw = fs.readFileSync("/home/ubuntu/backend/templates/courseEmail.txt", 'utf-8')
    const mailSent: mailStructure = await sendSingleEmail(signup.email, subject, mailContentRaw, mailContentHTML)
    if(mailSent.failure == false) {
        await db.query('UPDATE signups SET "emailsSent" = ARRAY_APPEND("emailsSent", $1) WHERE "id" = $2', [mailSent, signup.id])
        return {mailSent: true}
    } else {
        return {mailSent: false}
    }
}