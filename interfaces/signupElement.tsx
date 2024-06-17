import mailStructure from "./mailStructure";

export default interface signupElement{
    id: number,
    name: string,
    surname: string,
    email: string,
    phoneNumber: string,
    isCompany: boolean,
    companyName?: string,
    companyAdress?: string,
    companyNIP?: string,
    date: Date,
    courseID: number,
    supPrice: number,
    emailsSent?: mailStructure[],
    paidIn: number,
    invoiceNumber?: string,
    courseName?: string
}