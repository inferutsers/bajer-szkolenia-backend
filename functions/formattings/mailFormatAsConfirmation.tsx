import courseElement from "@/interfaces/courseElement";
import signupElement from "@/interfaces/signupElement";
import { getDateShortReadable, getTimeReadable } from "../dates";

export default function mailFormatAsConfirmation(input: string, signup: signupElement, course: courseElement): string{
    return input
    .replaceAll("{name}", signup.name)
    .replaceAll("{surname}", signup.surname)
    .replaceAll("{coursename}", course.title)
    .replaceAll("{coursedate}", getDateShortReadable(course.date))
    .replaceAll("{coursetime}", `${getTimeReadable(course.date)} - ${getTimeReadable((new Date(course.date.getTime() + (course.span as number)*60000)))}`)
    .replaceAll("{courseinstructor}", course.instructor ?? "brak")
    .replaceAll("{courseplace}", course.place ?? "brak")
    .replaceAll("{coursenote}", course.note ?? "brak")
    .replaceAll("{signupphonenumber}", signup.phoneNumber as string)
    .replaceAll("{signupemail}", signup.email as string)
    .replaceAll("{signupcompanyname}", signup.companyName ?? "brak")
    .replaceAll("{signupadress}", signup.adress.replaceAll("|=|", " "))
    .replaceAll("{signuppesel}", signup.pesel ?? "brak")
    .replaceAll("{signupcompanynip}", signup.companyNIP ?? "brak")
    .replaceAll("{paymenttitle}", `${signup.id}${signup.name}${signup.surname.replaceAll("-", "")}`)
    .replaceAll("{paymentamount}", (signup.supPrice as number).toFixed(2))
    .replaceAll("{attendeelist}", (signup.attendees.join(", ")))
}