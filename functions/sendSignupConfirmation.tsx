import courseElement from "@/interfaces/courseElement";
import signupElement from "@/interfaces/signupElement";
import { Pool } from "pg";
import mailFormatAsConfirmation from "./mailFormatAsConfirmation";
import fs from "fs"
import sendSingleEmail from "./sendSingleEmail";
import mailStructure from "@/interfaces/mailStructure";

export default async function sendSignupConfirmation(db: Pool, signup: signupElement, course: courseElement): Promise<{mailSent: boolean}>{
    const mailContentHTML = mailFormatAsConfirmation(fs.readFileSync("/home/ubuntu/backend/templates/signupConfirmation.html", 'utf-8'), signup, course)
    const mailContentRaw = mailFormatAsConfirmation(fs.readFileSync("/home/ubuntu/backend/templates/signupConfirmation.txt", 'utf-8'), signup, course)
    const mailSent: mailStructure = await sendSingleEmail(signup.email, "Potwierdzenie zapisu", mailContentRaw, mailContentHTML)
    if(mailSent.failure == false) {
        await db.query('UPDATE signups SET "emailsSent" = ARRAY_APPEND("emailsSent", $1)  WHERE "id" = $2', [mailSent, signup.id])
        return {mailSent: true}
    } else {
        return {mailSent: false}
    }
}