export default function removeSpecialCharacters(input: string, replaceWith: string = "?"): string{
    return input.replace(/[^\x00-\x7F]/g, replaceWith);
}