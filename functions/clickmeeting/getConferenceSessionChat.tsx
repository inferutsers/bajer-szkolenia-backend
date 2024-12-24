import { ClickMeetingConferenceChat } from "@/interfaces/ClickMeetingConferenceChat";
import { parse } from "csv-parse/sync";
import JSZip from "jszip";

export async function getConferenceSessionChat(sessionID: number): Promise<Array<any> | undefined>{
    const chatRequest = await fetch(`https://api.clickmeeting.com/v1/chats/${sessionID}`, {
        method: "GET",
        headers: {
            "X-Api-Key": process.env.CLICKMEETINGAPI ?? ""
        }
    })
    if (chatRequest.status !== 200){ return undefined }
    const chatZIP = await (await chatRequest.blob()).arrayBuffer()
    var zip = new JSZip()
    await zip.loadAsync(chatZIP)
    const publicChatCSV = await zip.file("public.csv")?.async('arraybuffer')
    if (!publicChatCSV) { return undefined }
    const publicChat: Array<any> = parse(Buffer.from(publicChatCSV), {relaxColumnCount: true})
    if (!publicChat || publicChat.length < 2) { return undefined }
    const chat: ClickMeetingConferenceChat[] = publicChat.slice(1).map(chat => ({name: chat[2], message: chat[3]}))
    return chat
}