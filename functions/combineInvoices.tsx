import { PDFDocument } from "pdf-lib";
import { v4 as uuidv4 } from 'uuid';
import { encrypt } from "node-qpdf2";
import fs from 'fs'
export async function combineInvoices(documents: Buffer[]): Promise<Buffer>{
    const output = await PDFDocument.create()
    const tempPath = `/tmp/${uuidv4()}`
    for (const document of documents){
        const pdf = await PDFDocument.load(document)
        const pages = await output.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(page => {
            output.addPage(page)
        })
    }
    output.setAuthor("BAJER EXPERT Centrum Szkoleniowe Spółdzielni i Wspólnot Mieszkaniowych Jerzy Bajer ul. Zygmunta Krasińskiego 4/2 07-100 Węgrów NIP: 8240003999 Tel: +48 728816495 Email: info@bajerszkolenia.pl")
    output.setCreator("BAJER EXPERT Centrum Szkoleniowe Spółdzielni i Wspólnot Mieszkaniowych Jerzy Bajer ul. Zygmunta Krasińskiego 4/2 07-100 Węgrów NIP: 8240003999 Tel: +48 728816495 Email: info@bajerszkolenia.pl")
    output.setCreationDate(new Date)
    output.setLanguage('pl-pl')
    output.setModificationDate(new Date)
    output.setProducer("BAJER EXPERT API")
    output.setSubject("Plik objęty prawami autorskimi")
    output.setTitle("Wykaz faktur")
    fs.writeFileSync(tempPath, Buffer.from((await output.save())))
    await encrypt({
        input: tempPath,
        output: tempPath,
        password: {
            owner: uuidv4(),
            user: ""
        },
        restrictions: {
            accessibility: "n",
            annotate: "n",
            assemble: "n",
            cleartextMetadata: false,
            extract: "n",
            form: "n",
            modify: "none",
            modifyOther: "n",
            print: "full",
            useAes: "n"
        }
    })
    const result = fs.readFileSync(tempPath)
    fs.unlinkSync(tempPath)
    return result
}