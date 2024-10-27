import administrationAccount from "@/interfaces/administrationAccount";
import { Pool } from "pg";
import bcrypt from 'bcrypt'
import { extendSessionValidity, getAdministrator } from "./queries/administration";

export default async function validateSession(db: Pool, sessionID: String, currentPassword?: string): Promise<administrationAccount | undefined>{
    var accountFound = await getAdministrator(db, sessionID)
    if (!accountFound) { return undefined }
    if (currentPassword) {
        if (!(await bcrypt.compare(currentPassword, accountFound.password as string))) { return undefined }
    }
    accountFound.password = undefined
    await extendSessionValidity(db, accountFound.id)
    return accountFound
}