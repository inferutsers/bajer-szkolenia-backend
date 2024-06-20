export function getCurrentDateShort(date: Date = new Date): string{
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function getCurrentDateLong(date: Date = new Date): string{
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}+${date.getTimezoneOffset()}`
}