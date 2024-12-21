export async function deleteConference(conferenceID: number): Promise<boolean>{
    const result = (await (await fetch(`https://api.clickmeeting.com/v1/conferences/${conferenceID}`, {
        method: "DELETE",
        headers: {
            "X-Api-Key": process.env.CLICKMEETINGAPI ?? ""
        }
    })).json()).result
    if (result != "OK") { return false }
    return true 
}