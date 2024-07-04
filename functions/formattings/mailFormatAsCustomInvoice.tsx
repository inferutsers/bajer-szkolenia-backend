export default function mailFormatAsCustomInvoice(input: string, invoiceNumber: string): string{
    return input
    .replaceAll("{invoiceno}", invoiceNumber)
}