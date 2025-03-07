import { ClickMeetingAttendeeURL } from "./ClickMeetingAttendeeURL";
import mailStructure from "./mailStructure";

export default interface signupElement{
    id: number,
    name: string,
    surname: string,
    email: string,
    phoneNumber: string,
    isCompany: boolean,
    companyName?: string,
    adress: string,
    companyNIP?: string,
    date: Date,
    courseID?: number,
    offerID?: number,
    supPrice: number,
    emailsSent?: mailStructure[],
    paidIn: number,
    invoiceNumber?: string,
    certificate: boolean
    serviceName?: string,
    pesel?: string,
    attendees: string[],
    servicePrice?: number,
    serviceDate?: Date,
    serviceHasWebinar: Boolean,
    reminderSent: Boolean,
    webinarURLsSent: Boolean,
    permissionRequired: number,
    webinarURLs?: ClickMeetingAttendeeURL[]
}