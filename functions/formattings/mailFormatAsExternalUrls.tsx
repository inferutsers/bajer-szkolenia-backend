import ADMcourseElement from "@/interfaces/ADMcourseElement";
import { getDateLongGMT2Readable } from "../dates";
import { ClickMeetingAttendeeURL } from "@/interfaces/ClickMeetingAttendeeURL";

export default function mailFormatAsExternalUrls(input: string, course: ADMcourseElement, attendees: ClickMeetingAttendeeURL[]): string{
    const formattedAttendees = attendees.map(attendee => {
        return `<p><a href="${attendee.url}" target="_parent" style="display: inline-block; padding: 10px; margin-bottom: 5px; background-color: #534af1; color: #ffffff !important; text-decoration: none; border-radius: 20px">${attendee.name} - DOŁĄCZ TERAZ</a></p>`
    }).join("")
    return input
    .replaceAll("{courseData}", `${course.title} (${getDateLongGMT2Readable(course.date)})`)
    .replaceAll("{attendeelist}", formattedAttendees)
}