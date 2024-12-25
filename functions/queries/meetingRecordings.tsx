import { ClickMeetingRecordingIndex } from "@/interfaces/ClickMeetingRecordingIndex";
import { Pool } from "pg";

export async function insertMeetingRecordings(db: Pool, recordings: ClickMeetingRecordingIndex[]){
    for (const recording of recordings){
        db.query(`UPDATE "meetingRecording" SET "url" = $1 WHERE "id" = $2`, [recording.url, recording.id])
        db.query(`INSERT INTO "meetingRecording"("id", "url", "name", "duration") SELECT $1, $2, $3, $4 WHERE NOT EXISTS (SELECT "id" FROM "meetingRecording" WHERE "id" = $1)`, [recording.id, recording.url, recording.name, recording.duration])
    }
}

export async function getMeetingRecording(db: Pool, recordingID: number | string): Promise<ClickMeetingRecordingIndex | undefined>{
    const result = await db.query(`SELECT * FROM "meetingRecording" WHERE "id" = $1 LIMIT 1`, [recordingID])
    if (!result?.rowCount) { return undefined }
    return {id: result.rows[0].id, name: result.rows[0].name, duration: result.rows[0].duration, url: result.rows[0].url, relativePath: result.rows[0].relativePath}
}

export async function updateRecordingRelativePath(db: Pool, recordingID: number | string, relativePath: string){
    await db.query(`UPDATE "meetingRecording" SET "relativePath" = $1 WHERE "id" = $2`, [relativePath, recordingID])
}