import signupElement from "@/interfaces/signupElement";
import { generateCertificatePDF } from "./generateCertificatePDF";
import ADMcourseElement from "@/interfaces/ADMcourseElement";
import { insertCertificate } from "../queries/certificate";
import { Pool } from "pg";
import { certificateData } from "@/interfaces/certificateData";
import { Attachment } from "nodemailer/lib/mailer";
import mailFormatAsCertificate from "../formattings/mailFormatAsCertificate";
import fs from 'fs'
import mailStructure from "@/interfaces/mailStructure";
import sendSingleEmailWithAttachment from "../emails/processor/sendSingleEmailWithAttachment";
import { addEmailSentToSignup } from "../queries/signups";

export async function generateCertificate(db: Pool, signup: signupElement, course: ADMcourseElement): Promise<{certificate?: certificateData, mailSent: boolean}>{
    const certificate = generateCertificatePDF(signup, course)
    if (!(await insertCertificate(db, certificate))) { return {mailSent: false} }
    const mailAttachment: Attachment = {
        content: certificate.file,
        filename: `Zaswiadczenia${signup.id}.pdf`
    }
    const mailContentHTML = mailFormatAsCertificate(fs.readFileSync("/home/ubuntu/backend/templates/certificate.html", 'utf-8'), signup)
    const mailContentRaw = mailFormatAsCertificate(fs.readFileSync("/home/ubuntu/backend/templates/certificate.txt", 'utf-8'), signup)
    const mailSent: mailStructure = await sendSingleEmailWithAttachment(signup.email, "Zaświadczenia o Uczestnictwie", mailContentRaw, mailContentHTML, mailAttachment)
    if(mailSent.failure == false) {
        await addEmailSentToSignup(db, signup.id, mailSent)
        return {mailSent: true, certificate: certificate}
    } else {
        return {mailSent: false, certificate: certificate}
    }
}