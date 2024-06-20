export default function mailFormatAsNewsletterConfirmation(input: string, email: string, url: string): string{
    return input
    .replaceAll("{email}", email)
    .replaceAll("{cancelLink}", url)
}