export function getDateShort(date: Date = new Date): string{
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function getDateLong(date: Date = new Date): string{
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}+${date.getTimezoneOffset()}`
}

export function getDateLongGMT2Readable(date: Date = new Date): string{
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours() + 2).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}