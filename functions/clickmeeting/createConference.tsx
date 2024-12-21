import { ClickMeetingConference } from '@/interfaces/ClickMeetingConference';
import { v4 as uuidv4 } from 'uuid';

export async function createConference(courseName: string, courseInstructor: string = "Prowadzący", courseStart: Date): Promise<ClickMeetingConference | undefined>{
    const createParams = new URLSearchParams({
        name: courseName,
        room_type: "webinar",
        permanent_room: "false",
        access_type: "3",
        custom_room_url_name: uuidv4(),
        lobby_enabled: "true",
        starts_at: courseStart.toISOString(),
        "settings[show_on_personal_page]": "false",
        "settings[thank_you_emails_enabled]": "false",
        "settings[connection_tester_enabled]": "false",
        "settings[phonegateway_enabled]": "false",
        "settings[recorder_autostart_enabled]": "true",
        "settings[room_invite_button_enabled]": "false",
        "settings[social_media_sharing_enabled]": "false",
        "settings[thank_you_page_url]": "https://bajerszkolenia.pl/online_dziekujemy"
    })
    const createResponse = await (await fetch(`https://api.clickmeeting.com/v1/conferences?` + createParams, {
        method: "POST",
        headers: {
            "X-Api-Key": process.env.CLICKMEETINGAPI ?? ""
        }
    })).json()
    if (!createResponse.room.id) { return undefined }
    const instructorToken = (await (await fetch(`https://api.clickmeeting.com/v1/conferences/${createResponse.room.id}/tokens?how_many=1`, {
        method: "POST",
        headers: {
            "X-Api-Key": process.env.CLICKMEETINGAPI ?? ""
        }
    })).json()).access_tokens[0].token
    const instructorLoginParams = new URLSearchParams({
        email: 'info@bajerszkolenia.pl',
        nickname: courseInstructor,
        role: "presenter",
        token: instructorToken
    })
    const instructorLoginHash = (await (await fetch(`https://api.clickmeeting.com/v1/conferences/${createResponse.room.id}/room/autologin_hash?` + instructorLoginParams, {
        method: "POST",
        headers: {
            "X-Api-Key": process.env.CLICKMEETINGAPI ?? ""
        }
    })).json()).autologin_hash
    return {id: createResponse.room.id, url: createResponse.room.room_url, instructorAccess: {url: createResponse.room.room_url + `?l=${instructorLoginHash}`, token: instructorToken}}
}