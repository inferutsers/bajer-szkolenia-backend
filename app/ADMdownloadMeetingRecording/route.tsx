import getDatabase from "@/connection/database";
import { downloadConferenceRecording } from "@/functions/clickmeeting/downloadConferenceRecording";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { getMeetingRecording, updateRecordingRelativePath } from "@/functions/queries/meetingRecordings";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm121012, rm121013 } from "@/responses/messages";
import { badRequest, notFound, unauthorized, unprocessableContent } from "@/responses/responses";
import fs from 'fs'

export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    recordingID = headers.get("recordingID")
    if (!sessionID || !recordingID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    var recording = await getMeetingRecording(db, recordingID)
    if (!recording) { systemLog(systemAction.ADMdownloadMeetingRecording, systemActionStatus.error, rm121012, validatedUser, db); return notFound(rm121012) }
    if (!recording.relativePath){
        const newRelativePath = await downloadConferenceRecording(recording)
        if (!newRelativePath) { systemLog(systemAction.ADMdownloadMeetingRecording, systemActionStatus.error, rm121013, validatedUser, db); return unprocessableContent(rm121013) }
        await updateRecordingRelativePath(db, recording.id, newRelativePath)
        recording.relativePath = newRelativePath
    }
    const file = fs.readFileSync("/home/ubuntu/" + recording.relativePath)
    return Response.json({file: file, fileName: `${recording.name}.mp4`}, {status: 200})
}