import moment from "moment-timezone"

export function getDateShort(date: Date = new Date): string{
    return moment(date).format("YYYY-MM-DD")
}

export function getDateLong(date: Date = new Date): string{
    return moment(date).format("YYYY-MM-DD HH:mm:ss")
}

export function getDateShortReadable(date: Date = new Date, inverted: boolean = false): string{
    if (inverted) { return moment(date).tz("Europe/Warsaw").format("DD-MM-YYYY z") }
    return moment(date).tz("Europe/Warsaw").format("YYYY-MM-DD z")
}

export function getTimeReadable(date: Date = new Date): string{
    return moment(date).tz("Europe/Warsaw").format("HH:mm z")
}

export function getDateLongGMT2Readable(date: Date = new Date): string{
    return moment(date).tz("Europe/Warsaw").format("YYYY-MM-DD HH:mm z")
}