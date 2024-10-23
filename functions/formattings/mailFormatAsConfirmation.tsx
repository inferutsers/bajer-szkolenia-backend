import courseElement from "@/interfaces/courseElement";
import signupElement from "@/interfaces/signupElement";
import { getDateShortReadable, getTimeReadable } from "../dates";

export default function mailFormatAsConfirmation(input: String, signup: signupElement, course: courseElement): String{
    return input
    .replaceAll("{name}", signup.name as string)
    .replaceAll("{surname}", signup.surname as string)
    .replaceAll("{coursename}", course.title as string)
    .replaceAll("{coursedate}", getDateShortReadable(course.date))
    .replaceAll("{coursetime}", `${getTimeReadable(course.date)} - ${getTimeReadable((new Date(course.date.getTime() + (course.span as number)*60000)))}`)
    .replaceAll("{courseinstructor}", course.instructor as string)
    .replaceAll("{courseplace}", course.place as string)
    .replaceAll("{coursenote}", course.note as string)
    .replaceAll("{signupphonenumber}", signup.phoneNumber as string)
    .replaceAll("{signupemail}", signup.email as string)
    .replaceAll("{signupcompanyname}", signup.companyName ? signup.companyName as string : "brak")
    .replaceAll("{signupadress}", signup.adress.replaceAll("|=|", " "))
    .replaceAll("{signuppesel}", signup.pesel ? signup.pesel as string : "brak")
    .replaceAll("{signupcompanynip}", signup.companyNIP ? signup.companyNIP as string : "brak")
    .replaceAll("{paymenttitle}", `${signup.id}${signup.name}${signup.surname}`)
    .replaceAll("{paymentamount}", (signup.supPrice as number).toFixed(2))
    .replaceAll("{attendeelist}", (signup.attendees.join(", ")))
}