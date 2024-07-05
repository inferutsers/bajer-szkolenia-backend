import BIR11DataQuery from "./dataQuery"
import BIR11Login from "./login"
import BIR11Logout from "./logout"

export default async function BIR11NipSearch(nip: string): Promise<string | undefined>{
    const sid = await BIR11Login()
    if (!sid) { return undefined }
    const data = await BIR11DataQuery(sid, nip)
    await BIR11Logout(sid)
    return data
}