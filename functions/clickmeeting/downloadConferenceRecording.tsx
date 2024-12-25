import { ClickMeetingRecordingIndex } from "@/interfaces/ClickMeetingRecordingIndex";
import fs from 'fs'

export async function downloadConferenceRecording(recording: ClickMeetingRecordingIndex): Promise<string | undefined>{
    if (!recording.url) { return undefined }
    const relativePath = `meetingRecordings/${recording.id}${recording.name}.mp4`
    const recordingDownloadRequest = await fetch(recording.url, {
        method: "GET"
    })
    if (recordingDownloadRequest.status !== 200){ return undefined }
    const recordingFile = await recordingDownloadRequest.blob()
    const recordingBuffer = Buffer.from(await recordingFile.arrayBuffer())
    fs.writeFileSync("/home/ubuntu/" + relativePath, recordingBuffer)
    return relativePath
}