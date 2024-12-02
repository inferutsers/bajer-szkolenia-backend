import { PublicFileData, ADMPublicFileOutline, ADMPublicFileKey } from "@/interfaces/PublicFileElement";
import { Pool } from "pg";
import { v4 as uuidv4 } from 'uuid';

const baseSelect = `SELECT 
        "f"."id" as "id", 
        "f"."fileName" as "fileName", 
        "f"."downloads" as "downloads", 
        "k"."id" as "key_id", 
        "k"."key" as "key_key", 
        "k"."usages" as "key_usages", 
        "k"."usageLimit" as "key_usageLimit", 
        "k"."expiryDate" as "key_expiryDate",
        "k"."note" as "key_note"
        FROM "public_files" "f"
        LEFT JOIN "public_file_keys" "k" ON "k"."fileID" = "f"."id"`

export async function ADMgetFiles(db: Pool): Promise<ADMPublicFileOutline[] | undefined>{
    const elements = await db.query(`
        ${baseSelect}
        ORDER BY "f"."fileName", "k"."note"
    `)
    if (!elements?.rowCount) { return undefined }
    return formatAsADMPublicFileOutlines(elements.rows)
}

export async function ADMgetFile(db: Pool, id: string | number): Promise<ADMPublicFileOutline | undefined>{
    const elements = await db.query(`
        ${baseSelect}
        WHERE "f"."id" = $1
        ORDER BY "k"."note"
    `, [id])
    if (!elements?.rowCount) { return undefined }
    const result = formatAsADMPublicFileOutlines(elements.rows)
    if (result.length !== 1) { return undefined} 
    return result[0]
}

export async function ADMcreateFileKey(db: Pool, fileID: string | number, note: string, usageLimit: number | string | undefined | null, expiryDate: string | undefined | null): Promise<boolean>{
    const element = await db.query(`INSERT INTO "public_file_keys"("key", "usageLimit", "fileID", "expiryDate", "note") VALUES ($1, $2, $3, $4, $5)`, [uuidv4(), usageLimit, fileID, expiryDate, note])
    if (!element?.rowCount) { return false }
    return true
}

export async function ADMcreateFile(db: Pool, file: Buffer, fileName: string): Promise<ADMPublicFileOutline | undefined>{
    const element = await db.query(`INSERT INTO "public_files"("data", "fileName") VALUES ($1, $2) RETURNING "id", "fileName"`, [file, fileName])
    if (!element?.rowCount) { return undefined }
    return formatAsNewADMPublicFileOutline(element.rows[0])
}

export async function ADMdeleteFileKey(db: Pool, fileKeyID: string | number){
    await db.query(`DELETE FROM "public_file_keys" WHERE "id" = $1`, [fileKeyID])
}

export async function ADMdeleteFile(db: Pool, fileID: string | number){
    await db.query(`DELETE FROM "public_files" WHERE "id" = $1`, [fileID])
}

export async function ADMeditFileKey(db: Pool, fileKeyID: string | number, note: string, usageLimit: string | number | null | undefined, expiryDate: string | null | undefined): Promise<boolean>{
    const element = await db.query(`UPDATE "public_file_keys" SET "note" = $1, "usageLimit" = $2, "expiryDate" = $3 WHERE "id" = $4`, [note, usageLimit, expiryDate, fileKeyID])
    if (!element?.rowCount) { return false } 
    return true
}

export async function ADMeditFile(db: Pool, fileID: string | number, fileName: string): Promise<ADMPublicFileOutline | undefined>{
    await db.query(`UPDATE "public_files" SET "fileName" = $1 WHERE "id" = $2`, [fileName, fileID])
    return await ADMgetFile(db, fileID)
}

export async function ADMdownloadFile(db: Pool, fileID: string | number): Promise<PublicFileData | undefined>{
    const element = await db.query(`SELECT "id", "data", "fileName" FROM "public_files" WHERE "id" = $1 LIMIT 1`, [fileID])
    if (!element?.rowCount) { return undefined }
    return {id: element.rows[0].id, key_id: element.rows[0].key_id, data: element.rows[0].data, fileName: element.rows[0].fileName }
}

export async function downloadFile(db: Pool, key: string): Promise<PublicFileData | undefined>{
    const element = await db.query(`SELECT 
        "f"."id" as "id", 
		"f"."data" as "data",
        "f"."fileName" as "fileName", 
        "k"."id" as "key_id", 
        "k"."usages" as "key_usages", 
        "k"."usageLimit" as "key_usageLimit", 
        "k"."expiryDate" as "key_expiryDate"
        FROM "public_file_keys" "k" 
        LEFT JOIN "public_files" "f" ON "k"."fileID" = "f"."id" 
		WHERE "k"."key" = $1`, [key])
    if (!element?.rowCount) { return undefined }
    const row = element.rows[0]
    if (!isKeyActive(row.key_usages, row.key_usageLimit, row.key_expiryDate)) { return undefined }
    return {id: row.id, key_id: row.key_id, data: row.data, fileName: row.fileName } 
}

export async function recordDownload(db: Pool, fileID?: number, keyID?: number){
    if (fileID) {
        await db.query('UPDATE "public_files" SET "downloads" = "downloads" + 1 WHERE "id" = $1', [fileID])
    }
    if (keyID) {
        await db.query('UPDATE "public_file_keys" SET "usages" = "usages" + 1 WHERE "id" = $1', [keyID])
    }
}

function isKeyActive(usages: number, usageLimit?: number, expiryDate?: Date): boolean{
    if (usageLimit){
        if (usages >= usageLimit) { return false }
    }
    if (expiryDate){
        if (expiryDate < new Date) { return false }
    }
    return true
}

export function formatAsNewADMPublicFileOutline(row: any): ADMPublicFileOutline{
    return { id: row.id, fileName: row.fileName, available: false, downloads: 0, keys: [] };
}

export function formatAsADMPublicFileOutlines(rows: any[]): ADMPublicFileOutline[]{
    return rows.reduce((results: ADMPublicFileOutline[], row) => {
        let file = results.find(f => f.id === row.id);
        if (!file) {
            file = { id: row.id, fileName: row.fileName, available: false, downloads: row.downloads, keys: [] };
            results.push(file);
        }

        if (row.key_id) {
            const isAvailable = isKeyActive(row.key_usages, row.key_usageLimit, row.key_expiryDate)
            if (isAvailable) { file.available = true }
            file.keys.push({ id: row.key_id, key: row.key_key, note: row.key_note, available: isAvailable, usages: row.key_usages, usageLimit: row.key_usageLimit, expiryDate: row.key_expiryDate });
        }

        return results;
    }, []);
}