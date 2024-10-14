import courseElement from "@/interfaces/courseElement";
import signupElement from "@/interfaces/signupElement";

export default function mailFormatAsCourseReminder(input: String, signup: signupElement, course: courseElement): String{
    return input
    .replaceAll("{name}", signup.name as string)
    .replaceAll("{surname}", signup.surname as string)
    .replaceAll("{coursename}", course.title as string)
    .replaceAll("{coursedate}", `${course.date.getFullYear()}-${String(course.date.getMonth() + 1).padStart(2, "0")}-${String(course.date.getDate()).padStart(2, "0")}`)
    .replaceAll("{coursetime}", `${String(course.date.getUTCHours() + 1).padStart(2, "0")}:${String(course.date.getUTCMinutes()).padStart(2, "0")} - ${String((new Date(course.date.getTime() + (course.span as number)*60000)).getUTCHours() + 1).padStart(2, "0")}:${String((new Date(course.date.getTime() + (course.span as number)*60000)).getUTCMinutes()).padStart(2, "0")} (GMT+2)`)
    .replaceAll("{courseinstructor}", course.instructor as string)
    .replaceAll("{courseplace}", course.place as string)
    .replaceAll("{coursenote}", course.note as string)
    .replaceAll("{paymentstatus}", signup.paidIn >= signup.supPrice ? `Opłacone` : (signup.paidIn == 0 ? `Oczekujemy na płatność` : `Otrzymaliśmy niepełną kwotę. Prosimy o wpłacenie pozostałej kwoty: ${(signup.supPrice - signup.paidIn).toFixed(2)} PLN`))
    .replaceAll("{attendeelist}", (signup.attendees.join(", ")))
}