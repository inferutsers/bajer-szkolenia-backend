export default function mailFormatAsNewsletterInvitation(input: string, url: string): string{
    return input
    .replaceAll("{confirmationUrl}", url)
}