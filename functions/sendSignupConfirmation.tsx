'use server'
import getMailer from "@/connection/mailer";
import signupElement from "@/interfaces/signupElement";

export default async function sendSignupConfirmation(signupElement: signupElement): Promise<Boolean>{
    const mailer = await getMailer()
    try {
        const info = await mailer.sendMail({
            from: `${process.env.MDISPLAYNAME} <${process.env.MLOGIN}>`, // sender address
            to: signupElement.email as string, // list of receivers
            subject: "POt zapisania", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world HTML!?</b>", // html body
        });
        if(info.rejected.length > 0) { return false }
        return true
    } catch {
        return false
    }
}