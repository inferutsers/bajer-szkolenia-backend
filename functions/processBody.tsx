import { NextRequest } from "next/server"

export default async function processBody(req: Request){
    const body = await req.json()
    if (JSON.stringify(body) == "[{}]"){ return undefined }
    return body
}