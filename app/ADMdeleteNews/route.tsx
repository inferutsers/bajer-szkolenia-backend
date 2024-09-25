import getDatabase from "@/connection/database";
import { dumpObject, systemAction, systemActionStatus } from "@/functions/logging/actions";
import { systemLog } from "@/functions/logging/log";
import { deleteNews, getAllNewsData } from "@/functions/queries/news";
import validateSession from "@/functions/validateSession";
import { rm001000, rm001001, rm031000 } from "@/responses/messages";
import { badRequest, notFound, unauthorized } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, res: Response){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    newsID = headers.get("newsID")
    if (!sessionID || !newsID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const news = await getAllNewsData(db, newsID)
    if (!news) { systemLog(systemAction.ADMdeleteNews, systemActionStatus.error, rm031000, validatedUser, db); return notFound(rm031000) }
    await deleteNews(db, newsID)
    systemLog(systemAction.ADMdeleteNews, systemActionStatus.success, `Usunięto aktualność\n${dumpObject(news)}`, validatedUser, db);
    return NextResponse.json(null, {status: 200})
}