import ADMcourseElement from "@/interfaces/ADMcourseElement";
import { getDateLongGMT2Readable } from "../dates";
import { ClickMeetingAttendeeURL } from "@/interfaces/ClickMeetingAttendeeURL";

export default function mailFormatAsExternalUrlsRAW(input: string, course: ADMcourseElement, attendees: ClickMeetingAttendeeURL[]): string{
    const formattedAttendees = attendees.map(attendee => {
        return `${attendee.name} - ${attendee.url}`
    }).join("\n")
    return input
    .replaceAll("{courseData}", `${course.title} (${getDateLongGMT2Readable(course.date)})`)
    .replaceAll("{attendeelist}", formattedAttendees)
}