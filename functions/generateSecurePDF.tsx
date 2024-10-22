import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs'
import { encrypt } from "node-qpdf2";
import courseElement from "@/interfaces/courseElement";
import { getDateShortReadable } from "./dates";


export default async function generateSecurePDF(file: Buffer, newTitle: string, course?: courseElement): Promise<Buffer>{
    const pdf = await PDFDocument.load(file);
    const tempPath = `/tmp/${uuidv4()}`
    if (course){
        const text = `BAJEREXPERT © Wszelkie prawa zastrzezone; Szkolenie #${course.id}`
        const textRight = `Pobrano ${getDateShortReadable(new Date).split('-').reverse().join("-")} z https://bajerszkolenia.pl`
        const afont = pdf.embedStandardFont(StandardFonts.Helvetica)
        pdf.getPages().forEach((page) => {
            page.drawText(text, {
                x: 10,
                y: 10,
                size: 10,
                color: rgb(0.75, 0.75, 0.75)
            });
            page.drawText(textRight, {
                x: page.getSize().width - afont.widthOfTextAtSize(textRight, 10) - 10,
                y: 10,
                size: 10,
                font: afont,
                color: rgb(0.75, 0.75, 0.75)
            })
        });
    }
    pdf.setAuthor("BAJER EXPERT Centrum Szkoleniowe Spółdzielni i Wspólnot Mieszkaniowych Jerzy Bajer ul. Zygmunta Krasińskiego 4/2 07-100 Węgrów NIP: 8240003999 Tel: +48 728816495 Email: info@bajerszkolenia.pl")
    pdf.setCreator("BAJER EXPERT Centrum Szkoleniowe Spółdzielni i Wspólnot Mieszkaniowych Jerzy Bajer ul. Zygmunta Krasińskiego 4/2 07-100 Węgrów NIP: 8240003999 Tel: +48 728816495 Email: info@bajerszkolenia.pl")
    pdf.setCreationDate(new Date)
    pdf.setLanguage('pl-pl')
    pdf.setModificationDate(new Date)
    pdf.setProducer("BAJER EXPERT API")
    pdf.setSubject("Plik objęty prawami autorskimi")
    pdf.setTitle(newTitle)
    fs.writeFileSync(tempPath, Buffer.from((await pdf.save())))
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