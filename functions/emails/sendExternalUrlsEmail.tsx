import ADMcourseElement from "@/interfaces/ADMcourseElement"
import mailFormatAsExternalUrls from "../formattings/mailFormatAsExternalUrls"
import fs from 'fs'
import { ClickMeetingAttendeeURL } from "@/interfaces/ClickMeetingAttendeeURL"
import sendSingleEmail from "./processor/sendSingleEmail"
import mailFormatAsExternalUrlsRAW from "../formattings/mailFormatAsExternalUrlsRAW"

export async function sendExternalUrlsEmail(course: ADMcourseElement, attendees: ClickMeetingAttendeeURL[], email: string){
    const mailContentHTML = mailFormatAsExternalUrls(fs.readFileSync("/home/ubuntu/backend/templates/externaljoinurls.html", 'utf-8'), course, attendees)
    const mailContentRaw = mailFormatAsExternalUrlsRAW(fs.readFileSync("/home/ubuntu/backend/templates/externaljoinurls.txt", 'utf-8'), course, attendees)
    await sendSingleEmail(email, "Linki umożliwiające dołączenie do szkolenia (ext.)", mailContentRaw, mailContentHTML)
}