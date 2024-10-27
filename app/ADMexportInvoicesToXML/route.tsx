import getDatabase from '@/connection/database';
import { systemAction, systemActionStatus } from '@/functions/logging/actions';
import { systemLog } from '@/functions/logging/log';
import { getInvoicesRamzesData } from '@/functions/queries/invoices';
import validateSession from '@/functions/validateSession';
import { rm001000, rm001001, rm061000 } from '@/responses/messages';
import { badRequest, notFound, unauthorized } from '@/responses/responses';
import builder from 'xmlbuilder'
export async function GET(req: Request){
    const headers = req.headers,
    sessionID = headers.get("sessionID"),
    dateStart = headers.get("dateStart"),
    dateEnd = headers.get("dateEnd")
    if (!sessionID || !dateStart || !dateEnd) { return badRequest(rm001001) }
    const db = await getDatabase(req),
    validatedUser = await validateSession(db, sessionID)
    if (!validatedUser) { return unauthorized(rm001000) }
    const invoices = await getInvoicesRamzesData(db, dateStart, dateEnd)
    if (!invoices) { systemLog(systemAction.ADMexportInvoicesToXML, systemActionStatus.error, rm061000, validatedUser, db); return notFound(rm061000) }
    const baza = builder.create('Baza', {version: '1.0', encoding: 'UTF-8', standalone: true})
    invoices!.forEach((invoice) => {
        const kontrahenci = baza.ele("knt_Kontrahenci")
        kontrahenci.ele("knt_Id", invoice.kontrahent.knt_Id)
        kontrahenci.ele("knt_Nazwa", invoice.kontrahent.knt_Nazwa)
        kontrahenci.ele("knt_Nip", invoice.kontrahent.knt_Nip)
        kontrahenci.ele("knt_Pesel", invoice.kontrahent.knt_Pesel)
        kontrahenci.ele("knt_Regon", invoice.kontrahent.knt_Regon)
        kontrahenci.ele("knt_Kod", invoice.kontrahent.knt_Kod)
        kontrahenci.ele("knt_Miasto", invoice.kontrahent.knt_Miasto)
        kontrahenci.ele("knt_Ulica", invoice.kontrahent.knt_Ulica)
        kontrahenci.ele("knt_DMP", invoice.kontrahent.knt_DMP)
        kontrahenci.ele("knt_CPV", invoice.kontrahent.knt_CPV)
        const nagdok = baza.ele("dok_Nagdok")
        nagdok.ele("dok_KntId", invoice.nagdok.dok_KntId)
        nagdok.ele("dok_DokId", invoice.nagdok.dok_DokId)
        nagdok.ele("dok_Numer", invoice.nagdok.dok_Numer)
        nagdok.ele("dok_DataDat", invoice.nagdok.dok_DataDat)
        nagdok.ele("dok_DataOper", invoice.nagdok.dok_DataOper)
        nagdok.ele("dok_DataZap", invoice.nagdok.dok_DataZap)
        nagdok.ele("dok_Opis", invoice.nagdok.dok_Opis)
        nagdok.ele("dok_Typ", invoice.nagdok.dok_Typ)
        nagdok.ele("dok_DokFoz", invoice.nagdok.dok_DokFoz)
        nagdok.ele("dok_JPK", invoice.nagdok.dok_JPK)
        const dekrety = baza.ele("dod_Dekrety")
        dekrety.ele("dod_DokId", invoice.dekret.dod_DokId)
        dekrety.ele("dod_PozNet", invoice.dekret.dod_PozNet)
        dekrety.ele("dod_PozBru", invoice.dekret.dod_PozBru)
        dekrety.ele("dod_PozVat", invoice.dekret.dod_PozVat)
        dekrety.ele("dod_PozSvt", invoice.dekret.dod_PozSvt)
    })
    const xml = baza.end({ pretty: true});
    const xmlbuffer = Buffer.from(xml, 'utf-8')
    systemLog(systemAction.ADMexportInvoicesToXML, systemActionStatus.success, `Eksport faktur\n${dateStart}\n${dateEnd}`, validatedUser, db)
    return Response.json(xmlbuffer, {status: 200})
}