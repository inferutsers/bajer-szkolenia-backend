import { ClickMeetingConference } from "@/interfaces/ClickMeetingConference";
import { ClickMeetingRecordingIndex } from "@/interfaces/ClickMeetingRecordingIndex";

export async function getConferenceRecordingList(conference: ClickMeetingConference){
    const recordingsRequest = await fetch(`https://api.clickmeeting.com/v1/conferences/${conference.id}/recordings`, {
        method: "GET",
        headers: {
            "X-Api-Key": process.env.CLICKMEETINGAPI ?? ""
        }
    })
    if (recordingsRequest.status !== 200){ return undefined }
    const recordings: ClickMeetingRecordingIndex[] = ((await recordingsRequest.json()) as Array<any>).map(recording => ({id: recording.id, name: recording.recording_name, duration: recording.recording_duration, url: recording.recording_url}))
    if (!recordings) { return undefined }
    return recordings
}