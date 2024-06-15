import getDatabase from "@/connection/database";
import validateSession from "@/functions/validateSession";
import { badRequest, notFound, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, res: Response){
    const headers = req.headers
    const sessionID = headers.get("sessionID")
    const newsID = headers.get("newsID")
    if (!sessionID || !newsID) { return badRequest }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized }
    const newsFoundArray = await db.query('SELECT * FROM "news" WHERE "id" = $1 LIMIT 1', [newsID])
    if (!newsFoundArray || newsFoundArray.rowCount == 0) { return notFound }
    await db.query('DELETE FROM "news" WHERE "id" = $1', [newsID])
    return NextResponse.json(null, {status: 200})
}