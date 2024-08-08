import getDatabase from "@/connection/database";
import { getCourses } from "@/functions/queries/course";
import { noContent } from "@/responses/responses";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response){
    const _ = req.headers,
    db = await getDatabase(req),
    courses = await getCourses(db)
    if (!courses) { return noContent }
    console.log(courses[0].offers)
    return NextResponse.json(courses, {status: 200})
}
