import fs from 'fs'
import BIR11SendRequest from './sendRequest'
export default async function BIR11Login(): Promise<string | undefined>{
    const url = process.env.BIRURL
    const key = process.env.BIRKEY
    const action = "http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj"
    if (!url || !key) { return undefined }
    const xml = fs.readFileSync('/home/ubuntu/backend/templates/bir11login.xml', 'utf-8').replaceAll("{url}", url).replaceAll("{action}", action).replaceAll("{key}", key)
    const result = await BIR11SendRequest(xml, action, url)
    const sid = result.sEnvelope.sBody[0].ZalogujResponse[0].ZalogujResult[0]
    return sid
}