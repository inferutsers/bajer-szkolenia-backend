import getDatabase from "@/connection/database"
import { badRequest, serviceUnavailable, unauthorized } from "@/responses/responses"
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';
import { rm001001, rm001009, rm001010, rm001011 } from "@/responses/messages";
import { systemLog } from "@/functions/logging/log";
import { systemAction, systemActionStatus } from "@/functions/logging/actions";
import { extendSessionValidity, getAdministratorByLogin } from "@/functions/queries/administration";
import { tfaMatcher } from "@/functions/TwoFactorAuth";

export async function GET(req: Request){
    const headers = req.headers,
    login = headers.get("SSLogin"),
    password = headers.get("SSPassword"),
    tfaKey = headers.get("SS2FAKey")
    if (!headers || !login || !password || !tfaKey) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const accountFound = await getAdministratorByLogin(db, login)
    if (!accountFound) { return serviceUnavailable(rm001009) }
    if (!(await bcrypt.compare(password, String(accountFound.password)))) { systemLog(systemAction.startSession, systemActionStatus.error, rm001009, accountFound, db); return unauthorized(rm001009) }
    if (!tfaMatcher(accountFound.tfaSecret as string, tfaKey)) { systemLog(systemAction.startSession, systemActionStatus.error, rm001009, accountFound, db); return unauthorized(rm001009) }
    if (Number(accountFound.status) <= 0) { systemLog(systemAction.startSession, systemActionStatus.error, rm001010, accountFound, db); return unauthorized(rm001010) }
    if (accountFound.technicalBreak) { systemLog(systemAction.startSession, systemActionStatus.error, rm001011.replaceAll("$$$", accountFound.technicalBreak), accountFound, db); return unauthorized(rm001011.replaceAll("$$$", accountFound.technicalBreak)) }
    const newSessionID = uuidv4();
    await extendSessionValidity(db, accountFound.id, newSessionID)
    systemLog(systemAction.startSession, systemActionStatus.success, `Zalogowano do systemu (${newSessionID})`, accountFound, db);
    return Response.json(newSessionID, {status: 200})
}