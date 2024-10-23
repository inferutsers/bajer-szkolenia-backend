import ADMcourseElement from "@/interfaces/ADMcourseElement";
import { getDateLongGMT2Readable } from "../dates";

export default function mailFormatAsCourseEmail(input: string, message: string, courseData: ADMcourseElement): string{
    return input
    .replaceAll("{courseEmailMessage}", message)
    .replaceAll("{courseData}", `${courseData.title} (${getDateLongGMT2Readable(courseData.date)})`)
}