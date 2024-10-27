import getDatabase from "@/connection/database";
import generateSecurePDF from "@/functions/generateSecurePDF";
import { getPublicFile, getPublicFileKey, recordDownload } from "@/functions/queries/publicFiles";
import { getSignup } from "@/functions/queries/signups";
import { rm001001, rm101000, rm101001, rm101002, rm101003 } from "@/responses/messages";
import { badRequest, notFound } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    key = headers.get("fileKey")
    if (!key) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const fileKey = await getPublicFileKey(db, key)
    if (!fileKey) { return notFound(rm101000) }
    const fileKeyOwner = fileKey.owner ? await getSignup(db, fileKey.owner) : undefined
    if (fileKey.owner && !fileKeyOwner) { return notFound(rm101002) }
    if (fileKey.usageLimit) {
        if (fileKey.usages >= fileKey.usageLimit) { return notFound(rm101003) }
    }
    var file = await getPublicFile(db, fileKey.fileID)
    if (!file) { return notFound(rm101001) }
    await recordDownload(db, file.id, fileKey.id)
    if (file.watermarked) {
        file.data = await generateSecurePDF(file.data, file.fileName, undefined, fileKeyOwner)
        return Response.json(file, {status: 200})
    }
    return Response.json(file, {status: 200})
}