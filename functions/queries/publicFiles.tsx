import PublicFileElement from "@/interfaces/PublicFileElement";
import { Pool } from "pg";

export async function getPublicFile(db: Pool, key: string): Promise<PublicFileElement | undefined>{
    const file = await db.query('SELECT * FROM "public_files" WHERE "key" = $1 AND "available" = true LIMIT 1', [key])
    if (!file || file.rowCount == 0) { return undefined }
    db.query('UPDATE "public_files" SET "downloads" = "downloads" + 1 WHERE "key" = $1 AND "available" = true', [key])
    return formatAsPublicFile(file.rows[0])
}

export function formatAsPublicFile(row: any): PublicFileElement{
    return { id: row.id, data: row.data, fileName: row.fileName, key: row.key, available: row.available }
}