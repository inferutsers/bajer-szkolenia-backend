import { ClickMeetingConference } from "@/interfaces/ClickMeetingConference";
import { ClickMeetingConferenceSession } from "@/interfaces/ClickMeetingConferenceSession";

export async function getConferenceSessions(conference: ClickMeetingConference): Promise<ClickMeetingConferenceSession[] | undefined>{
    const sessionsRequest = await fetch(`https://api.clickmeeting.com/v1/conferences/${conference.id}/sessions`, {
        method: "GET",
        headers: {
            "X-Api-Key": process.env.CLICKMEETINGAPI ?? ""
        }
    })
    if (sessionsRequest.status !== 200){ return undefined }
    const sessions: ClickMeetingConferenceSession[] = ((await sessionsRequest.json()) as Array<any>).map(session => ({id: session.id, total_visitors: session.total_visitors, peak_visitors: session.max_visitors, start_date: session.start_date, end_date: session.end_date}))
    if (!sessions) { return undefined }
    return sessions
}