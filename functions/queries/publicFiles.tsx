import { PublicFileElement, PublicFileKey } from "@/interfaces/PublicFileElement";
import { Pool } from "pg";

export async function getPublicFileKey(db: Pool, key: string): Promise<PublicFileKey | undefined>{
    const element = await db.query('SELECT * FROM "public_file_keys" WHERE "key" = $1 AND "available" = true LIMIT 1', [key])
    if (!element || element.rowCount == 0) { return undefined }
    const formattedElement = formatAsPublicFileKey(element.rows[0])
    return formattedElement
}

export async function getPublicFile(db: Pool, id: number): Promise<PublicFileElement | undefined>{
    const file = await db.query('SELECT * FROM "public_files" WHERE "id" = $1 AND "available" = true LIMIT 1', [id])
    if (!file || file.rowCount == 0) { return undefined }
    return formatAsPublicFile(file.rows[0])
}

export async function recordDownload(db: Pool, fileID?: number, keyID?: number){
    if (fileID) {
        await db.query('UPDATE "public_files" SET "downloads" = "downloads" + 1 WHERE "id" = $1 AND "available" = true', [fileID])
    }
    if (keyID) {
        await db.query('UPDATE "public_file_keys" SET "usages" = "usages" + 1 WHERE "id" = $1 AND "available" = true', [keyID])
    }
}

export function formatAsPublicFileKey(row: any): PublicFileKey{
    return { id: row.id, key: row.key, owner: row.owner, available: row.available, usages: row.usages, usageLimit: row.usageLimit, fileID: row.fileID}
}

export function formatAsPublicFile(row: any): PublicFileElement{
    return { id: row.id, data: row.data, fileName: row.fileName, available: row.available, watermarked: row.watermarked }
}