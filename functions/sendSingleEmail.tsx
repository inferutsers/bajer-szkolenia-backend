'use server'
import getMailer from "@/connection/mailer";
import mailStructure from "@/interfaces/mailStructure";
import signupElement from "@/interfaces/signupElement";

export default async function sendSingleEmail(receiver: String, subject: String, text: String, html: String): Promise<mailStructure>{
    const mailer = await getMailer()
    try {
        const info = await mailer.sendMail({
            from: `${process.env.MDISPLAYNAME} <${process.env.MLOGIN}>`,
            to: receiver as string,
            subject: subject as string,
            text: text as string,
            html: html as string
        });
        if(info.rejected.length > 0) { return { receivers: [receiver], subject: subject, text: text, html: html, failure: true } }
        return { messageID: info.messageId, response: info.response, receivers: [receiver], subject: subject, text: text, html: html, failure: false }
    } catch {
        return { receivers: [receiver], subject: subject, text: text, html: html, failure: true }
    }
}