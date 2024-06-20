import getMailer from "@/connection/mailer";
import mailStructure from "@/interfaces/mailStructure";
import { Attachment } from "nodemailer/lib/mailer";
import { getCurrentDateLong } from "./dates";

export default async function sendSingleEmailWithAttachment(receiver: String, subject: String, text: String, html: String, attachment: Attachment): Promise<mailStructure>{
    const mailer = await getMailer()
    try {
        const info = await mailer.sendMail({
            from: `${process.env.MDISPLAYNAME} <${process.env.MLOGIN}>`,
            to: receiver as string,
            subject: subject as string,
            text: text as string,
            html: html as string,
            attachments: [attachment]
        });
        if(info.rejected.length > 0) { return { date: getCurrentDateLong(), receivers: [receiver], subject: subject, text: text, html: html, failure: true } }
        return { date: getCurrentDateLong(), messageID: info.messageId, response: info.response, receivers: [receiver], subject: subject, text: text, html: html, failure: false }
    } catch {
        return { date: getCurrentDateLong(), receivers: [receiver], subject: subject, text: text, html: html, failure: true }
    }
}