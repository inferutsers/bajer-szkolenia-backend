import getDatabase from "@/connection/database"
import { badRequest } from "@/responses/responses"
import { NextResponse } from "next/server"

export async function GET(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    if (!sessionID) { return badRequest }
    const db = await getDatabase(req)
    await db.query('UPDATE "administration" SET "sessionID" = NULL, "sessionValidity" = NULL WHERE "sessionID" = $1', [sessionID])
    return NextResponse.json(null, {status: 200})
}