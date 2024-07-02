import { Pool } from "pg";
import mailFormatAsNewsletterEmail from "./mailFormatAsNewstellerEmail";
import fs from 'fs'
import mailStructure from "@/interfaces/mailStructure";
import sendBulkBCCEmail from "./sendBulkBCCEmail";
import { newsletterReceiver } from "@/interfaces/newsletterReceiver";

export default async function sendNewsletterEmail(db: Pool, subject: string, message: string, receivers: newsletterReceiver[]): Promise<{mailSent: boolean}>{
    const mailContentHTML = mailFormatAsNewsletterEmail(fs.readFileSync("/home/ubuntu/backend/templates/newsletterMessage.html", 'utf-8'), message)
    const mailContentRaw = fs.readFileSync("/home/ubuntu/backend/templates/newsletterMessage.txt", 'utf-8')
    const mailSent: mailStructure = await sendBulkBCCEmail(receivers.map((result) => (result.email)), subject, mailContentRaw, mailContentHTML)
    if(mailSent.failure == false) {
        await db.query('INSERT INTO "newsletterMessages"("message", "receivers") VALUES ($1, $2)', [mailSent, receivers.map((result) => result.id)])
        return {mailSent: true}
    } else {
        return {mailSent: false}
    }
}