import offerElement from "@/interfaces/offerElement";
import signupElement from "@/interfaces/signupElement";

export default function mailFormatAsOfferConfirmation(input: String, signup: signupElement, offer: offerElement): String{
    return input
    .replaceAll("{name}", signup.name as string)
    .replaceAll("{surname}", signup.surname as string)
    .replaceAll("{coursenames}", offer.courses!.map((course) => (course.title)).join(", "))
    .replaceAll("{coursedates}", offer.courses!.map((course) => (`${course.date.getFullYear()}-${String(course.date.getMonth() + 1).padStart(2, "0")}-${String(course.date.getDate()).padStart(2, "0")} (${String(course.date.getUTCHours() + 2).padStart(2, "0")}:${String(course.date.getUTCMinutes()).padStart(2, "0")} - ${String((new Date(course.date.getTime() + (course.span as number)*60000)).getUTCHours() + 2).padStart(2, "0")}:${String((new Date(course.date.getTime() + (course.span as number)*60000)).getUTCMinutes()).padStart(2, "0")} (GMT+2))`)).join(", "))
    .replaceAll("{courseinstructor}", offer.courses!.map((course) => (course.instructor ? course.instructor : "nieznany")).join(", "))
    .replaceAll("{offernote}", offer.note as string)
    .replaceAll("{signupphonenumber}", signup.phoneNumber as string)
    .replaceAll("{signupemail}", signup.email as string)
    .replaceAll("{signupcompanyname}", signup.companyName as string)
    .replaceAll("{signupadress}", signup.adress.replaceAll("|=|", " "))
    .replaceAll("{signuppesel}", signup.pesel as string)
    .replaceAll("{signupcompanynip}", signup.companyNIP as string)
    .replaceAll("{paymenttitle}", `${signup.id}${signup.name}${signup.surname}`)
    .replaceAll("{paymentamount}", (signup.supPrice as number).toFixed(2))
}