export function getDateShort(date: Date = new Date): string{
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function getDateLong(date: Date = new Date): string{
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}+${date.getTimezoneOffset()}`
}