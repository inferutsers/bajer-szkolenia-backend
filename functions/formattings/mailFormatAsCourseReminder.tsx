import signupElement from "@/interfaces/signupElement";
import { getDateShortReadable, getTimeReadable } from "../dates";
import ADMcourseElement from "@/interfaces/ADMcourseElement";

export default function mailFormatAsCourseReminder(input: string, signup: signupElement, course: ADMcourseElement): string{
    return input
    .replaceAll("{name}", signup.name)
    .replaceAll("{surname}", signup.surname)
    .replaceAll("{coursename}", course.title)
    .replaceAll("{coursedate}", getDateShortReadable(course.date))
    .replaceAll("{coursetime}", `${getTimeReadable(course.date)} - ${getTimeReadable((new Date(course.date.getTime() + (course.span as number)*60000)))}`)
    .replaceAll("{courseinstructor}", course.instructor ?? "brak")
    .replaceAll("{courseplace}", course.place ?? "brak")
    .replaceAll("{coursenote}", course.note ?? "brak")
    .replaceAll("{paymentstatus}", signup.paidIn >= signup.supPrice ? `Opłacone` : (signup.paidIn == 0 ? `Oczekujemy na płatność` : `Otrzymaliśmy niepełną kwotę. Prosimy o wpłacenie pozostałej kwoty: ${(signup.supPrice - signup.paidIn).toFixed(2)} PLN`))
    .replaceAll("{attendeelist}", (signup.attendees.join(", ")))
}