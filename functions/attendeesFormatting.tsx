export default function formatAttendees(name: string | null, surname: string | null, isCompany: boolean, header: string | null): string[] | null{
    if (!isCompany) { return [`${name} ${surname}`] }
    if (!header) { return null }
    return JSON.parse(header)
}