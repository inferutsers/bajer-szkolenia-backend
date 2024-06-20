import { Pool } from "pg"
import mailFormatAsNewsletterInvitation from "./mailFormatAsNewsletterInvitation"
import fs from 'fs'
import mailStructure from "@/interfaces/mailStructure"
import sendSingleEmail from "./sendSingleEmail"

export default async function sendNewsletterInvitation(db: Pool, id: number, email: string, confirmationKey: string): Promise<{mailSent: boolean}>{
    const url = `https://bajerszkolenia.pl/confirmNewsletter/${confirmationKey}`
    const mailContentHTML = mailFormatAsNewsletterInvitation(fs.readFileSync("/home/ubuntu/backend/templates/newsletterInvitation.html", 'utf-8'), url)
    const mailContentRaw = mailFormatAsNewsletterInvitation(fs.readFileSync("/home/ubuntu/backend/templates/newsletterInvitation.txt", 'utf-8'), url)
    const mailSent: mailStructure = await sendSingleEmail(email, "Zapis do nawsletteru", mailContentRaw, mailContentHTML)
    if(mailSent.failure == false) {
        await db.query('UPDATE "newsletterUsers" SET "emailsSent" = ARRAY_APPEND("emailsSent", $1) WHERE "id" = $2', [mailSent, id])
        return {mailSent: true}
    } else {
        return {mailSent: false}
    }
}