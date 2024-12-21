import { ClickMeetingAttendeeURL } from "@/interfaces/ClickMeetingAttendeeURL"
import { ClickMeetingConference } from "@/interfaces/ClickMeetingConference"

export async function generateAttendeeURL(conference: ClickMeetingConference, attendees: {name: string, email: string}[]): Promise<ClickMeetingAttendeeURL[] | undefined>{
    const tokens = ((await (await fetch(`https://api.clickmeeting.com/v1/conferences/${conference.id}/tokens?how_many=${attendees.length}`, {
        method: "POST",
        headers: {
            "X-Api-Key": process.env.CLICKMEETINGAPI ?? ""
        }
    })).json()).access_tokens as Array<any>).map(token => token.token)
    if (!tokens) { return undefined }
    const results = Promise.all(await attendees.map(async (attendee, index) => {
        const loginParams = new URLSearchParams({
            email: attendee.email,
            nickname: attendee.name,
            role: "listener",
            token: tokens[index]
        })
        const loginHash = (await (await fetch(`https://api.clickmeeting.com/v1/conferences/${conference.id}/room/autologin_hash?` + loginParams, {
            method: "POST",
            headers: {
                "X-Api-Key": process.env.CLICKMEETINGAPI ?? ""
            }
        })).json()).autologin_hash
        return {name: attendee.name, url: conference.url + `?l=${loginHash}`, token: tokens[index]}
    }))
    return results
}