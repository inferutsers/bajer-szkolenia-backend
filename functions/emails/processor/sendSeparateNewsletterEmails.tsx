import getMailer from "@/connection/mailer";
import mailStructure from "@/interfaces/mailStructure";
import { getDateLong } from "../../dates";
import { bulkEmailReceiver } from "@/interfaces/newsletterReceiver";

export default async function sendSeparateNewsletterEmails(receivers: bulkEmailReceiver[], subject: string, text: string, html: string): Promise<mailStructure>{
    const mailer = await getMailer()
    console.log(receivers)
    var successCount = 0
    var errorCount = 0
    for (const receiver of receivers){
        const formattedMessage = receiver.newsletterKey ? html.replaceAll("{newsletterFooter}", `Otrzymujesz tego maila, ponieważ zapisałeś/aś się do newslettera. Jeżeli chcesz zrezygnować kliknij <a href="https://bajerszkolenia.pl/cancelNewsletter/${receiver.newsletterKey}">tutaj</a>.`) : html.replaceAll("{newsletterFooter}", "Otrzymujesz tego maila, ponieważ zapisałeś/aś się do newslettera. Jeżeli chcesz zrezygnować prosimy o kontakt.")
        try {
            const info = await mailer.sendMail({
                from: `${process.env.MDISPLAYNAME} <${process.env.MLOGIN}>`,
                to: receiver.email,
                subject: subject,
                text: text,
                html: formattedMessage
            });
            if(info.rejected.length > 0) { errorCount += 1 }
            successCount += 1
        } catch {
            errorCount += 1
        }
    }
    return { date: getDateLong(), receivers: receivers.map(rec => rec.email), subject: subject, text: text, html: html, failure: false }
}