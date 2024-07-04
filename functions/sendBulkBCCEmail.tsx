import getMailer from "@/connection/mailer";
import mailStructure from "@/interfaces/mailStructure";
import { getDateLong } from "./dates";

export default async function sendBulkBCCEmail(receivers: string[], subject: String, text: String, html: String): Promise<mailStructure>{
    const mailer = await getMailer()
    try {
        const info = await mailer.sendMail({
            from: `${process.env.MDISPLAYNAME} <${process.env.MLOGIN}>`,
            bcc: receivers,
            subject: subject as string,
            text: text as string,
            html: html as string
        });
        if(info.rejected.length > 0) { return { date: getDateLong(), receivers: [], subject: subject, text: text, html: html, failure: true } }
        return { date: getDateLong(), messageID: info.messageId, response: info.response, receivers: [], subject: subject, text: text, html: html, failure: false }
    } catch {
        return { date: getDateLong(), receivers: [], subject: subject, text: text, html: html, failure: true }
    }
}