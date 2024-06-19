import getDatabase from "@/connection/database";
import { getRecentCourses } from "@/functions/queries/course";
import { noContent } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const _ = req.headers
    const db = await getDatabase(req)
    const courses = await getRecentCourses(db)
    if (!courses) {return noContent}
    return NextResponse.json(courses, {status: 200})
}