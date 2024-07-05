import fs from 'fs'
import BIR11SendRequest from './sendRequest'
import { parseStringPromise } from 'xml2js'
export default async function BIR11DataQuery(sid: string, nip: string): Promise<string | undefined>{
    const url = process.env.BIRURL
    const action = "http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty"
    if (!url) { return undefined }
    const xml = fs.readFileSync('/home/ubuntu/backend/templates/bir11findbynip.xml', 'utf-8').replaceAll("{url}", url).replaceAll("{action}", action).replaceAll("{nip}", nip)
    const result = await BIR11SendRequest(xml, action, url, sid)
    const data = (await parseStringPromise(result.sEnvelope.sBody[0].DaneSzukajPodmiotyResponse[0].DaneSzukajPodmiotyResult[0])).root.dane[0]
    return data
}