import getDatabase from "@/connection/database";
import generateSecurePDF from "@/functions/generateSecurePDF";
import { getFileExtension } from "@/functions/getFileExtension";
import { getCourse, getCourseFile } from "@/functions/queries/course";
import { rm001001, rm011000, rm011003, rm011011 } from "@/responses/messages";
import { badRequest, notFound, unprocessableContent } from "@/responses/responses";

export async function GET(req: Request){
    const headers = req.headers,
    courseID = headers.get("courseID")
    if (!courseID) { return badRequest(rm001001) }
    const db = await getDatabase(req)
    const course = await getCourse(db, courseID)
    if (!course) { return notFound(rm011000) }
    if (!course.fileName) { return notFound(rm011003) }
    const courseFile = await getCourseFile(db, course.id)
    if (!courseFile) { return notFound(rm011011) }
    const fileExtension = getFileExtension(course.fileName)
    if (!fileExtension) { return unprocessableContent(rm011011) }
    const newFileName = `Program Szkolenia BAJEREXPERT #${courseID}.${fileExtension}`
    if (fileExtension == "pdf") { 
        return Response.json({name: newFileName, file: await generateSecurePDF(courseFile, newFileName, course)}, {status: 200})
    }
    return Response.json({name: newFileName, file: courseFile}, {status: 200})
}