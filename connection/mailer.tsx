import nodemailer from "nodemailer"
export default async function getMailer(): Promise<nodemailer.Transporter>{
    return nodemailer.createTransport({
        host: process.env.MHOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.MLOGIN,
          pass: process.env.MPASSWORD,
        },
    });
}