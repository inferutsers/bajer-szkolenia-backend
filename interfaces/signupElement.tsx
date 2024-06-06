import mailStructure from "./mailStructure";

export default interface signupElement{
    id: Number,
    name: String,
    surname: String,
    email: String,
    phoneNumber: String,
    isCompany: Boolean,
    companyName?: String,
    companyAdress?: String,
    companyNIP?: String,
    date: Date,
    courseID: Number,
    supPrice: Number,
    emailsSent?: mailStructure[],
    paidIn: Number,
    invoices?: Buffer[]
}