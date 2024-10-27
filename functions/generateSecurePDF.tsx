import { PDFDocument, rgb, RotationTypes, StandardFonts } from "pdf-lib";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs'
import { encrypt } from "node-qpdf2";
import courseElement from "@/interfaces/courseElement";
import { getDateLongGMT2Readable, getDateShortReadable } from "./dates";
import signupElement from "@/interfaces/signupElement";
import removeSpecialCharacters from "./formattings/removeSpecialCharacters";

export default async function generateSecurePDF(file: Buffer, newTitle: string, course?: courseElement, signup?: signupElement): Promise<Buffer>{
    const pdf = await PDFDocument.load(file);
    const tempPath = `/tmp/${uuidv4()}`
    if (course){
        const text = `BAJEREXPERT © Wszelkie prawa zastrzezone; Szkolenie #${course.id}`
        const textRight = `Pobrano ${getDateShortReadable(new Date, true)} z https://bajerszkolenia.pl`
        const font = pdf.embedStandardFont(StandardFonts.Helvetica)
        pdf.getPages().forEach((page) => {
            page.drawText(text, {
                x: 10,
                y: 10,
                font: font,
                size: 10,
                color: rgb(0.75, 0.75, 0.75)
            });
            page.drawText(textRight, {
                x: page.getSize().width - font.widthOfTextAtSize(textRight, 10) - 10,
                y: 10,
                size: 10,
                font: font,
                color: rgb(0.75, 0.75, 0.75)
            })
        });
    } else if (signup) {
        const font = pdf.embedStandardFont(StandardFonts.Helvetica)
        const textWidth = font.widthOfTextAtSize(String(signup.id), 70);
        const textHeight = 70;
        const radians = (-45 * Math.PI) / 180;
        const xOffset = (textWidth / 2) * Math.cos(radians) - (textHeight / 2) * Math.sin(radians);
        const yOffset = (textWidth / 2) * Math.sin(radians) + (textHeight / 2) * Math.cos(radians);
        const copyrightText = `BAJEREXPERT © Wszelkie prawa zastrzezone`
        const identityText = `Wydano dla uczestnika #${signup.id}`
        const courseText = removeSpecialCharacters(`Szkolenie ${signup.serviceName} w dniu ${getDateLongGMT2Readable(signup.serviceDate)}`, "")
        const websiteText = "https://bajerszkolenia.pl"
        pdf.getPages().forEach((page) => {
            page.drawText(courseText, {
                x: 10,
                y: page.getSize().height - 10 - font.heightAtSize(10) / 2,
                size: 10,
                font: font,
                color: rgb(0.75, 0.75, 0.75)
            })
            page.drawText(String(signup.id), {
                x: (page.getSize().width / 2) - xOffset,
                y: (page.getSize().height / 2) - yOffset,
                size: 70,
                font: font,
                color: rgb(0.75, 0.75, 0.75),
                rotate: {type: RotationTypes.Degrees, angle: -45},
                opacity: 0.3
            })
            page.drawText(copyrightText, {
                x: 10,
                y: 10,
                size: 10,
                font: font,
                color: rgb(0.75, 0.75, 0.75),
            })
            page.drawText(identityText, {
                x: font.widthOfTextAtSize(copyrightText, 10) + 15,
                y: 10,
                size: 8,
                font: font,
                color: rgb(0.75, 0.75, 0.75),
            })
            page.drawText(websiteText, {
                x: page.getSize().width - font.widthOfTextAtSize(websiteText, 10) - 10,
                y: 10,
                size: 10,
                font: font,
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