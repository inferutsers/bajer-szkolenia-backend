export enum systemAction{
    ADMchangePassowrd = 0.2,
    ADMchangeTfa = 0.3,
    ADMcreateCourse = 1.1,
    ADMdeleteCourse = 1.2,
    ADMeditCourse = 1.3,
    ADMdeleteCourseFile = 1.3,
    ADMcancelSignup = 2.1,
    ADMeditSignup = 2.2,
    ADMcreateNews = 3.1,
    ADMdeleteNews = 3.2,
    ADMeditNews = 3.3,
    ADMcreateOffer = 4.1,
    ADMdeleteOffer = 4.2,
    ADMdeleteOfferFile = 4.3,
    ADMeditOffer = 4.4
}

export enum systemActionStatus{
    success = "Sukces",
    error = "Błąd"
}

export function dumpObject(object: Object): String{
    return Object.entries(object).map(([key, value]) => {
        if (!Buffer.isBuffer(value) && key != "emailsSent"){
            return `${key}: ${value}`
        }
    }).join("\n")
}

export function compareObjects(old: Object, current: Object): String{
    return Object.entries(current).map(([key, value]) => {
        const oldvalue = Object.entries(old).find(([okey, ovalue]) => { return (okey == key) })?.[1]
        if ((Object.prototype.toString.call(value) !== '[object Date]' && value != oldvalue) || (Object.prototype.toString.call(value) === '[object Date]' && (value as Date).getTime() != (oldvalue as Date).getTime())){
            if (!Buffer.isBuffer(value) && key != "emailsSent" && key != "slotsUsed"){
                return `${key}: ${oldvalue} ===> ${value}`
                console.log(`FOUND DIFF ${key}: ${oldvalue} ===> ${value}`)
            } else { return "" }
        } else { return "" }
    }).filter((value) => {return (value != "")}).join("\n")
}