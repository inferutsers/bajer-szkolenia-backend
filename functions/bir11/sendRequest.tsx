import soapRequest from "easy-soap-request";
import { parseStringPromise } from "xml2js";

export default async function BIR11SendRequest(xml: string, action: string, url: string, sid: string = ""): Promise<any>{
    const sampleHeaders = {
        'Content-Type': 'application/soap+xml;charset=UTF-8',
        'soapAction': action,
        'sid': sid
    };
    const response = await soapRequest({
        url: url,
        headers: sampleHeaders,
        xml: xml
    })
    const string = String(response.response.body).slice(203).replaceAll(":", "")
    const responseBody = await parseStringPromise(string)
    return responseBody
}