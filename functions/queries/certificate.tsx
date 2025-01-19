import { certificateData } from "@/interfaces/certificateData";
import { Pool } from "pg";

export async function insertCertificate(db: Pool, certificate: certificateData): Promise<boolean>{
    const result = await db.query(`INSERT INTO "certificates"("signup", "course", "key", "name", "file", "issueDate") VALUES ($1, $2, $3, $4, $5, $6)`, [certificate.signup, certificate.course, certificate.key, certificate.name, certificate.file, certificate.issueDate])
    if (!result?.rowCount) { return false }
    return true
}

export async function getCertificate(db: Pool, signup: string | number): Promise<certificateData | undefined>{
    const result = await db.query(`SELECT * FROM "certificates" WHERE "signup" = $1 LIMIT 1`, [signup])
    if (!result?.rowCount) { return undefined }
    return {
        key: result.rows[0].key,
        name: result.rows[0].name,
        signup: result.rows[0].signup,
        course: result.rows[0].course,
        file: result.rows[0].file,
        issueDate: result.rows[0].issueDate
    }
}