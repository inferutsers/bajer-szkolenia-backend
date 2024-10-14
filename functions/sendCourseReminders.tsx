import { Pool } from "pg";
import { getUpcomingCourses } from "./queries/course";
import { getCourseSignups } from "./getCourseSignups";
import sendSingleEmail from "./emails/processor/sendSingleEmail";
import fs from 'fs'
import mailFormatAsCourseReminder from "./formattings/mailFormatAsCourseReminder";
import { addEmailSentToSignup } from "./queries/signups";

export async function sendCourseReminders(db: Pool): Promise<number>{
    const courses = await getUpcomingCourses(db)
    var mailsSent: number = 0
    if (courses){
        for await (const course of courses){
            const signups = await getCourseSignups(db, course.id)
            if (signups) {
                const filteredSignups = signups.filter(signup => { return !signup.reminderSent })
                for await (const signup of filteredSignups){
                    const mailContentHTML = mailFormatAsCourseReminder(fs.readFileSync("/home/ubuntu/backend/templates/courseReminder.html", 'utf-8'), signup, course)
                    const mailContentRaw = mailFormatAsCourseReminder(fs.readFileSync("/home/ubuntu/backend/templates/courseReminder.txt", 'utf-8'), signup, course)
                    const mailSent = await sendSingleEmail(signup.email, "Przypomnienie o nadchodzącym szkoleniu", mailContentRaw, mailContentHTML)
                    if(mailSent.failure == false) {
                        await addEmailSentToSignup(db, signup.id, mailSent, true)
                        mailsSent++
                    }
                }
            }
        }
    }
    return mailsSent
}