import { rm021013, rm021022, rm021023, rm021024, rm021025, rm021026 } from "@/responses/messages";

export function validateFormData(isCompany: string, companyNip: string | null, phoneNumber: string, adress: string, name: string, surname: string, attendees: string[], email: string): String | undefined  {
    if (isCompany == 'true' && companyNip!.length != 10) { return rm021013 }
    if (!/^\d{9}$/.test(phoneNumber)) { return rm021022 }
    if (!/^\d{2}-\d{3}$/.test(adress.split("|=|")[1])) { return rm021023 }
    if (!/^[a-zA-Z]+$/.test(name) || !/^[a-zA-Z-]+$/.test(surname)) { return rm021024 }
    if (attendees.map(attendee => { return /^[a-zA-Z]+ [a-zA-Z-]+$/.test(attendee) }).includes(false)) { return rm021025 }
    if (!/^[a-zA-Z0-9!#$%&'*+-/=?^_\{|}~]+@[a-zA-Z0-9-.]+$/.test(email)) { return rm021026 }
    return undefined
}
// returns error message if needed