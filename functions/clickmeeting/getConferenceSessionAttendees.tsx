import { ClickMeetingConference } from "@/interfaces/ClickMeetingConference";
import { ClickMeetingConferenceAttendee } from "@/interfaces/ClickMeetingConferenceAttendee";

export async function getConferenceSessionAttendees(conference: ClickMeetingConference, sessionID: number): Promise<ClickMeetingConferenceAttendee[] | undefined>{
    const attendeesRequest = await fetch(`https://api.clickmeeting.com/v1/conferences/${conference.id}/sessions/${sessionID}/attendees`, {
        method: "GET",
        headers: {
            "X-Api-Key": process.env.CLICKMEETINGAPI ?? ""
        }
    })
    if (attendeesRequest.status !== 200){ return undefined }
    const attendees: ClickMeetingConferenceAttendee[] = ((await attendeesRequest.json()) as Array<any>).filter(attendee => attendee.role == "listener").map(attendee => ({id: attendee.id, name: attendee.nickname, email: attendee.email.split("@")[1] == "bajerszkolenia.pl" ? undefined : attendee.email, start_date: attendee.start_date, end_date: attendee.end_date, adress: `${attendee.city ?? "Nieznane"}, ${attendee.country_iso3}`}))
    if (!attendees || attendees.length < 1) { return undefined }
    return attendees
}