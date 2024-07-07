import courseElement from "@/interfaces/courseElement";
import signupElement from "@/interfaces/signupElement";

export default function mailFormatAsConfirmation(input: String, signup: signupElement, course: courseElement): String{
    return input
    .replaceAll("{name}", signup.name as string)
    .replaceAll("{surname}", signup.surname as string)
    .replaceAll("{coursename}", course.title as string)
    .replaceAll("{coursedate}", `${course.date.getFullYear()}-${String(course.date.getMonth() + 1).padStart(2, "0")}-${String(course.date.getDate()).padStart(2, "0")}`)
    .replaceAll("{coursetime}", `${String(course.date.getUTCHours() + 2).padStart(2, "0")}:${String(course.date.getUTCMinutes()).padStart(2, "0")} - ${String((new Date(course.date.getTime() + (course.span as number)*60000)).getUTCHours() + 2).padStart(2, "0")}:${String((new Date(course.date.getTime() + (course.span as number)*60000)).getUTCMinutes()).padStart(2, "0")} (GMT+2)`)
    .replaceAll("{courseinstructor}", course.instructor as string)
    .replaceAll("{courseplace}", course.place as string)
    .replaceAll("{coursenote}", course.note as string)
    .replaceAll("{signupphonenumber}", signup.phoneNumber as string)
    .replaceAll("{signupemail}", signup.email as string)
    .replaceAll("{signupcompanyname}", signup.companyName as string)
    .replaceAll("{signupcompanyadress}", signup.adress.replaceAll("|=|", " "))
    .replaceAll("{signupcompanynip}", signup.companyNIP as string)
    .replaceAll("{paymenttitle}", `${signup.id}${signup.name}${signup.surname}`)
    .replaceAll("{paymentamount}", (signup.supPrice as number).toFixed(2))
}