import administrationAccount from "@/interfaces/administrationAccount";
import { systemAction, systemActionStatus } from "./actions";
import { Pool } from "pg";
import getDatabase from "@/connection/database";
import { getDateLong } from "../dates";

export async function systemLog(action: systemAction, status: systemActionStatus, message: String, administrator?: administrationAccount, pdb?: Pool) {
    const db = pdb ? pdb : await getDatabase()
    await db.query(`INSERT INTO "logs"("administrator", "action", "status", "message", "date") VALUES ($1,$2,$3,$4,$5)`, [administrator?.id, action, status, message, getDateLong()])
}