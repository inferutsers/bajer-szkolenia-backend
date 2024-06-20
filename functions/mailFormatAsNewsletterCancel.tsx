export default function mailFormatAsNewsletterCancel(input: string, email: string): string{
    return input
    .replaceAll("{email}", email)
}