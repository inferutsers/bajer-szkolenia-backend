import getMailer from "@/connection/mailer";
import mailStructure from "@/interfaces/mailStructure";
import { Attachment } from "nodemailer/lib/mailer";
import { getDateLong } from "../../dates";

export default async function sendSingleEmailWithAttachment(receiver: string, subject: string, text: string, html: string, attachment: Attachment): Promise<mailStructure>{
    const mailer = await getMailer()
    try {
        const info = await mailer.sendMail({
            from: `${process.env.MDISPLAYNAME} <${process.env.MLOGIN}>`,
            to: receiver,
            subject: subject,
            text: text,
            html: html,
            attachments: [attachment]
        });
        if(info.rejected.length > 0) { return { date: getDateLong(), receivers: [receiver], subject: subject, text: text, html: html, failure: true } }
        return { date: getDateLong(), messageID: info.messageId, response: info.response, receivers: [receiver], subject: subject, text: text, html: html, failure: false }
    } catch {
        return { date: getDateLong(), receivers: [receiver], subject: subject, text: text, html: html, failure: true }
    }
}