import courseElement from "@/interfaces/courseElement";
import signupElement from "@/interfaces/signupElement";
import { Pool } from "pg";
import mailFormatAsConfirmation from "../formattings/mailFormatAsConfirmation";
import fs from "fs"
import sendSingleEmail from "./processor/sendSingleEmail";
import mailStructure from "@/interfaces/mailStructure";
import { addEmailSentToSignup } from "../queries/signups";
import offerElement from "@/interfaces/offerElement";

// TO DO

export default async function sendSignupConfirmation(db: Pool, signup: signupElement, course?: courseElement, offer?: offerElement): Promise<{mailSent: boolean}>{
    if (!course) { return {mailSent: false}}
    const mailContentHTML = mailFormatAsConfirmation(fs.readFileSync("/home/ubuntu/backend/templates/signupConfirmation.html", 'utf-8'), signup, course)
    const mailContentRaw = mailFormatAsConfirmation(fs.readFileSync("/home/ubuntu/backend/templates/signupConfirmation.txt", 'utf-8'), signup, course)
    const mailSent: mailStructure = await sendSingleEmail(signup.email, "Potwierdzenie zapisu", mailContentRaw, mailContentHTML)
    if(mailSent.failure == false) {
        await addEmailSentToSignup(db, signup.id, mailSent)
        return {mailSent: true}
    } else {
        return {mailSent: false}
    }
}