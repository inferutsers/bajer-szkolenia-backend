import { Pool } from "pg";
import { getUpcomingCourses, getUpcomingCourses1day } from "./queries/course";
import { addEmailSentToSignup, getCourseSignups } from "./queries/signups";
import mailFormatAsExternalUrls from "./formattings/mailFormatAsExternalUrls";
import fs from 'fs'
import sendSingleEmail from "./emails/processor/sendSingleEmail";
import mailFormatAsExternalUrlsRAW from "./formattings/mailFormatAsExternalUrlsRAW";

export async function sendWebinarURLs(db: Pool): Promise<number>{
    const courses = await getUpcomingCourses1day(db)
    var mailsSent: number = 0
    if (courses){
        for await (const course of courses.filter(course => course.webinar)){
            const signups = await getCourseSignups(db, course.id)
            if (signups) {
                const filteredSignups = signups.filter(signup => { return (!signup.webinarURLsSent && signup.webinarURLs) })
                for await (const signup of filteredSignups){
                    const mailContentHTML = mailFormatAsExternalUrls(fs.readFileSync("/home/ubuntu/backend/templates/externaljoinurls.html", 'utf-8'), course, signup.webinarURLs!)
                    const mailContentRaw = mailFormatAsExternalUrlsRAW(fs.readFileSync("/home/ubuntu/backend/templates/externaljoinurls.txt", 'utf-8'), course, signup.webinarURLs!)
                    const mailSent = await sendSingleEmail(signup.email, "Linki umożliwiające dołączenie do szkolenia", mailContentRaw, mailContentHTML)
                    if(mailSent.failure == false) {
                        await addEmailSentToSignup(db, signup.id, mailSent, false, true)
                        mailsSent++
                    }
                }
            }
        }
    }
    return mailsSent
}  