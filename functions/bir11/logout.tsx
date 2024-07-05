import fs from 'fs'
import BIR11SendRequest from './sendRequest'
export default async function BIR11Logout(sid: string): Promise<boolean | undefined>{
    const url = process.env.BIRURL
    const action = "http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Wyloguj"
    if (!url) { return undefined }
    const xml = fs.readFileSync('/home/ubuntu/backend/templates/bir11logout.xml', 'utf-8').replaceAll("{url}", url).replaceAll("{action}", action).replaceAll("{sid}", sid)
    const result = await BIR11SendRequest(xml, action, url)
    const response = result.sEnvelope.sBody[0].WylogujResponse[0].WylogujResult[0] == 'true'
    return response
}