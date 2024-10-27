import { getDateShort } from "../dates"

export default async function checkIfTaxPayer(nip: string): Promise<boolean>{
    const url = process.env.TAXURL
    const complateURL = `${url}${nip}?date=${getDateShort()}`
    const result = await fetch(complateURL)
    const json = await result.json()
    if (!json.result) { return false }
    const subject = json.result.subject
    if (!subject) { return false }
    return true
}