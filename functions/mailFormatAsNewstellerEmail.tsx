export default function mailFormatAsNewsletterEmail(input: string, message: string): string{
    return input
    .replaceAll("{newsletterMessage}", message)
}