import signupElement from "@/interfaces/signupElement";

export default function mailFormatAsInvoice(input: string, signup: signupElement, invoiceNumber: string): string{
    return input
    .replaceAll("{name}", signup.name)
    .replaceAll("{surname}", signup.surname)
    .replaceAll("{invoiceno}", invoiceNumber)
    .replaceAll("{topay}", (signup.supPrice as number - (signup.paidIn as number)).toFixed(2))
}