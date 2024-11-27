import getDatabase from "@/connection/database";
import { downloadFile, recordDownload } from "@/functions/queries/publicFiles";
import { rm001001, rm101003 } from "@/responses/messages";
import { badRequest, notFound } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    key = headers.get("fileKey")
    if (!key) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const file = await downloadFile(db, key)
    if (!file) { return notFound(rm101003) }
    await recordDownload(db, file.id, file.key_id)
    // if (file.watermarked) {
        // file.data = await generateSecurePDF(file.data, file.fileName, undefined, fileKeyOwner)
        // return Response.json(file, {status: 200})
    // }
    return Response.json(file, {status: 200})
}