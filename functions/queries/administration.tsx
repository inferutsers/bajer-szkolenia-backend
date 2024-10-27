import administrationAccount from "@/interfaces/administrationAccount";
import { Pool } from "pg";
import { getDateLong } from "../dates";

export async function extendSessionValidity(db: Pool, id: Number, newSessionID?: string){
    const newValidity = getDateLong(new Date((new Date).getTime() + Number(process.env.PANELSESSIONVALIDITY)*60000))
    await db.query(`UPDATE "administration" SET "sessionValidity" = $1 ${newSessionID ? `, "sessionID" = $3` : ``} WHERE "id" = $2`, [newValidity, id, newSessionID].filter(self => (self)))
}

export async function updatePassword(db: Pool, newPassword: string, id: Number){
    await db.query('UPDATE "administration" SET "password" = $1, "sessionID" = NULL, "sessionValidity" = NULL WHERE "id" = $2', [newPassword, id])
}

export async function updateTfaSecret(db: Pool, newSecret: string, id: Number){
    await db.query('UPDATE "administration" SET "tfaSecret" = $1, "sessionID" = NULL, "sessionValidity" = NULL WHERE "id" = $2', [newSecret, id])
}

export async function getAdministratorByPRT(db: Pool, prt: string): Promise<administrationAccount | undefined> {
    const results = await db.query(`SELECT 
        "a"."id", 
        "a"."login", 
        "a"."displayName", 
        "a"."status", 
        FROM "administration" "a"
        WHERE "passwordResetToken" = $1 AND
        "status" > 0
        LIMIT 1`
    , [prt])
    if (!results?.rowCount) { return undefined} 
    return formatAsAdministrationAccount(results.rows[0])
}

export async function getAdministratorByLogin(db: Pool, login: string): Promise<administrationAccount | undefined>{
    const results = await db.query(`SELECT 
        "a"."id", 
        "a"."login", 
        "a"."displayName", 
        "a"."password", 
        "a"."status", 
        "a"."sessionID", 
        "a"."sessionValidity", 
        "a"."passwordResetToken",
        "a"."tfaSecret", 
        "o"."stringValue" AS "technicalBreak"
        FROM "administration" "a" 
        LEFT JOIN "options" "o" ON 
        "o"."id" = 1 AND 
        "o"."integerValue" > "a"."status" AND 
        "o"."integerValue" != 0 
        WHERE "login" = $1 AND "passwordResetToken" IS NULL 
        LIMIT 1`
    , [login])
    if (!results?.rowCount) { return undefined} 
    return formatAsAdministrationAccount(results.rows[0])
}

export async function getAdministrator(db: Pool, sessionID: String): Promise<administrationAccount | undefined> {
    const results = await db.query(`SELECT 
        "a"."id", 
        "a"."login", 
        "a"."displayName", 
        "a"."password", 
        "a"."status", 
        "a"."sessionID", 
        "a"."sessionValidity", 
        "a"."passwordResetToken", 
        "a"."tfaSecret", 
        "o"."stringValue" 
        FROM "administration" "a" 
        LEFT JOIN "options" "o" ON
        "o"."id" = 1 AND 
        "o"."integerValue" > "a"."status" AND 
        "o"."integerValue" != 0 
        WHERE "sessionID" = $1 AND "status" > 0 AND "sessionValidity" > $2 AND "passwordResetToken" IS NULL AND "o"."stringValue" IS NULL 
        LIMIT 1
    `, [sessionID, getDateLong()])
    if (!results?.rowCount) { return undefined }
    return formatAsAdministrationAccount(results.rows[0])
}

export function formatAsAdministrationAccount(row: any): administrationAccount{
    return {
        id: row.id, 
        login: row.login, 
        password: row.password,
        displayName: row.displayName, 
        status: row.status, 
        sessionID: row.sessionID, 
        sessionValidity: row.sessionValidity, 
        passwordResetToken: row.passwordResetToken, 
        tfaSecret: row.tfaSecret,
        technicalBreak: row.technicalBreak
    }
}