import signupElement from "@/interfaces/signupElement";

export default function mailFormatAsCertificate(input: string, signup: signupElement): string{
    return input
    .replaceAll("{name}", signup.name)
    .replaceAll("{surname}", signup.surname)
}