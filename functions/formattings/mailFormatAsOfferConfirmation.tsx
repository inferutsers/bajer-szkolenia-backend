import offerElement from "@/interfaces/offerElement";
import signupElement from "@/interfaces/signupElement";
import { getDateLongGMT2Readable } from "../dates";

export default function mailFormatAsOfferConfirmation(input: String, signup: signupElement, offer: offerElement): String{
    return input
    .replaceAll("{name}", signup.name as string)
    .replaceAll("{surname}", signup.surname as string)
    .replaceAll("{coursenames}", offer.courses!.map((course) => (course.title)).join(", "))
    .replaceAll("{coursedates}", offer.courses!.map((course) => (getDateLongGMT2Readable(course.date))).join(", "))
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