export enum systemAction{
    ADMchangePassowrd = 0.2,
    ADMchangeTfa = 0.3,
    changePasswordWithToken = 0.4,
    startSession = 0.5,
    ADMcreateCourse = 1.1,
    ADMdeleteCourse = 1.2,
    ADMeditCourse = 1.3,
    ADMdeleteCourseFile = 1.4,
    ADMemailCourse = 1.5,
    ADMuploadCourseFile = 1.6,
    ADMcancelSignup = 2.1,
    ADMeditSignup = 2.2,
    ADMemailSignup = 2.3,
    ADMgenerateInvoice = 2.4,
    ADMresendSignupConfirmation = 2.5,
    ADMsignupPayment = 2.6,
    ADMsignupPaymentINVOICE = 2.61,
    ADMcreateNews = 3.1,
    ADMdeleteNews = 3.2,
    ADMeditNews = 3.3,
    ADMcreateOffer = 4.1,
    ADMdeleteOffer = 4.2,
    ADMdeleteOfferFile = 4.3,
    ADMeditOffer = 4.4,
    ADMuploadOfferFile = 4.5,
    ADMgenerateCustomInvoice = 5.1,
    ADMsendCustomInvoice = 5.2,
    ADMexportInvoicesToXML = 6.1,
    ADMexportInvoicesToPDF = 6.2,
    ADMsendNewsletterMessage = 8.1,
    ADMcreateFile = 10.1,
    ADMeditFile = 10.2,
    ADMdeleteFile = 10.3,
    ADMcreateFileKey = 10.4,
    ADMeditFileKey = 10.5,
    ADMdeleteFileKey = 10.6,
    ADMcreateOnlineMeeting = 11.1,
    ADMcreateOnlineMeetingJoinURL = 11.2,
    ADMcreateOnlineMeetingExternalJoinURL = 11.3,
    ADMdeleteOnlineMeeting = 11.4,
    ADMmeetingSessions = 11.5,
    ADMmeetingAttendees = 11.6,
    ADMmeetingChat = 11.7,
    AUTOCRONlockcourses = 90.1,
    AUTOCRONcoursereminders = 90.2,
    AUTOCRONcoursearchive = 90.3,
    AUTOCRONsendURLS = 90.3
}

export enum systemActionStatus{
    success = "Sukces",
    error = "Błąd"
}

export function dumpObject(object: Object): string{
    return Object.entries(object).map(([key, value]) => {
        if (!Buffer.isBuffer(value) && key != "emailsSent"){
            return `${key}: ${value}`
        }
    }).join("\n")
}

export function compareObjects(old: Object, current: Object): string{
    return Object.entries(current).map(([key, value]) => {
        const oldvalue = Object.entries(old).find(([okey, ovalue]) => { return (okey == key) })?.[1]
        if ((Object.prototype.toString.call(value) !== '[object Date]' && value != oldvalue) || (Object.prototype.toString.call(value) === '[object Date]' && (value as Date).getTime() != (oldvalue as Date).getTime())){
            if (!Buffer.isBuffer(value) && key != "emailsSent" && key != "slotsUsed"){
                return `${key}: ${oldvalue} ===> ${value}`
            } else { return "" }
        } else { return "" }
    }).filter((value) => {return (value != "")}).join("\n")
}