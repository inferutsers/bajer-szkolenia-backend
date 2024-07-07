import mailStructure from "@/interfaces/mailStructure";
import { newsletterMessage } from "@/interfaces/newsletterMessage";
import { bulkEmailReceiver } from "@/interfaces/newsletterReceiver";
import { Pool } from "pg";

export async function getNewsletterUserPresenceByEmail(db: Pool, email: string): Promise<Boolean>{
    const newsletterUser = await db.query('SELECT "id" FROM "newsletterUsers" WHERE "email" = $1 LIMIT 1', [email])
    if (!newsletterUser || newsletterUser.rowCount == 0) { return false }
    return true
}
export async function getNewsletterUserPresenceByConfirmationKey(db: Pool, key: string, confirmed: boolean = false): Promise<Boolean>{
    const newsletterUser = await db.query('SELECT "id" FROM "newsletterUsers" WHERE "confirmationKey" = $1 AND "confirmed" = $2 LIMIT 1', [key, confirmed])
    if (!newsletterUser || newsletterUser.rowCount == 0) { return false }
    return true
}
export async function gatherNewsletterEmails(db: Pool): Promise<bulkEmailReceiver[] | undefined>{
    const newsletterUsers = await db.query('SELECT "id", "email" FROM "newsletterUsers" WHERE "confirmed" = TRUE')
    if (!newsletterUsers || newsletterUsers.rowCount == 0) { return undefined }
    return newsletterUsers.rows.map((result) => ({id: result.id, email: result.email}))
}
export async function getNewsletterMessages(db: Pool): Promise<newsletterMessage[] | undefined>{
    const newsletterMessages = await db.query('SELECT * FROM "newsletterMessages" ORDER BY "date" DESC')
    if (!newsletterMessages || newsletterMessages.rowCount == 0) { return undefined }
    return newsletterMessages.rows.map((result) => ({id: result.id, receiversAmount: result.receivers.length, message: removeMessageHeader(result.message.html), date: result.date}))
}

export async function confirmNewsletterUser(db: Pool, confirmationKey: string): Promise<string | undefined>{
    const user = await db.query('UPDATE "newsletterUsers" SET "confirmed" = true WHERE "confirmationKey" = $1 RETURNING "email"', [confirmationKey])
    if (!user || user.rowCount == 0) { return undefined }
    return user.rows[0].email
}

export async function getNewsletterUserEmail(db: Pool, confirmationKey: string): Promise<string | undefined>{
    const user = await db.query('SELECT "email" FROM "newsletterUsers" WHERE "confirmationKey" = $1 LIMIT 1', [confirmationKey])
    if (!user || user.rowCount == 0) { return undefined }
    return user.rows[0].email
}

export async function deleteNewsletterUser(db: Pool, confirmationKey: string, email: string) {
    await db.query('DELETE FROM "newsletterUsers" WHERE "confirmationKey" = $1 AND "email" = $2', [confirmationKey, email])
}

export async function addEmailSentToNewsletterUser(db: Pool, confirmationKey: string | number, email: string, mailSent: mailStructure){
    await db.query('UPDATE "newsletterUsers" SET "emailsSent" = ARRAY_APPEND("emailsSent", $1) WHERE "confirmationKey" = $2 AND "email" = $3', [mailSent, confirmationKey, email])
}

function removeMessageHeader(input: string): string{
    return input
    .replaceAll(`<h1 style="text-align: center;"><strong>BAJER EXPERT</strong></h1>
<div style="text-align: center;"><em>Centrum Szkoleniowe Sp&oacute;łdzielni i Wsp&oacute;lnot Mieszkaniowych Jerzy Bajer</em></div>
<div style="text-align: center;"><em>ul. Zygmunta Krasińskiego 4/2 07-100 Węgr&oacute;w</em></div>
<div style="text-align: center;"><em>NIP: 8240003999</em></div>
<div style="text-align: center;"><em>Tel: +48 728816495</em><br /></div>
<div style="text-align: center;"><em>Email: <a href="mailto:info@bajerszkolenia.pl">info@bajerszkolenia.pl</a></em></div>
<div>&nbsp;</div>`, "")
    .replaceAll(`<div style="text-align: left;">&nbsp;</div>
<div style="text-align: left;"></div>
<div style="text-align: left;">Pozdrawiamy,</div>
<div style="text-align: left;"><em>Zesp&oacute;ł BAJER EXPERT</em></div>`, "")
}