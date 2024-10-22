export function getFileExtension(fileName: string): string | undefined{
    if (!fileName.includes(".")) { return undefined }
    return reverseString(reverseString(fileName).split(".")[0])
}

function reverseString(str: string): string{
    return str.split("").reverse().join("")
}