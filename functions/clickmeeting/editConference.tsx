import { ClickMeetingConference } from '@/interfaces/ClickMeetingConference';

export async function editConference(conference: ClickMeetingConference, courseName: string, courseInstructor: string = "Prowadzący", courseStart: Date): Promise<ClickMeetingConference | undefined>{
    const editParams = new URLSearchParams({
        name: courseName,
        starts_at: courseStart.toISOString(),
        permanent_room: "false"
    })
    const editResponse = await fetch(`https://api.clickmeeting.com/v1/conferences/${conference.id}?` + editParams, {
        method: "PUT",
        headers: {
            "X-Api-Key": process.env.CLICKMEETINGAPI ?? ""
        }
    })
    const instructorLoginParams = new URLSearchParams({
        email: 'info@bajerszkolenia.pl',
        nickname: courseInstructor,
        role: "presenter",
        token: conference.instructorAccess.token
    })
    const instructorLoginHash = (await (await fetch(`https://api.clickmeeting.com/v1/conferences/${conference.id}/room/autologin_hash?` + instructorLoginParams, {
        method: "POST",
        headers: {
            "X-Api-Key": process.env.CLICKMEETINGAPI ?? ""
        }
    })).json()).autologin_hash
    return {id: conference.id, url: conference.url, instructorAccess: {url: conference.url + `?l=${instructorLoginHash}`, token: conference.instructorAccess.token}}
}