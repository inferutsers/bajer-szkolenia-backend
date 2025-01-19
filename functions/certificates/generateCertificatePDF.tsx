import ADMcourseElement from "@/interfaces/ADMcourseElement";
import signupElement from "@/interfaces/signupElement";
import jsPDF from "jspdf";
import fs from 'fs'
import { getDateLongGMT2Readable, getDateShortReadable, getTimeReadable, getTimeReadableWithoutTimezone } from "../dates";
import { v4 as uuidv4 } from 'uuid';
import { certificateData } from "@/interfaces/certificateData";

export function generateCertificatePDF(signup: signupElement, course: ADMcourseElement): certificateData{
    const blueColor = "#003cff"
    const defaultColor = "#000000"
    const pdf = new jsPDF({encryption: {
        ownerPassword: uuidv4(),
        userPermissions: ["print"]
    }})
    const keys: string[] = []
    pdf.setProperties({
        title: `Zaświadczenie ${signup.id}`,
        subject: `Zaświadczenie ${signup.id}`,
        author: "BAJEREXPERT Globalny System Zarządzania",
        creator: "BAJEREXPERT API"
    })
    const regularFont = fs.readFileSync("/home/ubuntu/backend/fonts/Arial-Unicode-Regular.ttf", 'binary')
    pdf.addFileToVFS('Arial-Unicode-Regular.ttf', regularFont);
    pdf.addFont('Arial-Unicode-Regular.ttf', 'ArialUTF', 'normal');
    const boldFont = fs.readFileSync("/home/ubuntu/backend/fonts/Arial-Unicode-Bold.ttf", 'binary')
    pdf.addFileToVFS('Arial-Unicode-Bold.ttf', boldFont);
    pdf.addFont('Arial-Unicode-Bold.ttf', 'ArialUTF', 'bold');
    pdf.setFont("ArialUTF", "bold")
    signup.attendees.forEach((attendee, index) => { 
        const key = uuidv4()
        pdf.setFontSize(8)
        pdf.setTextColor(defaultColor)
        pdf.text("BAJER EXPERT\nCentrum Szkoleniowe Spółdzielni\ni Wspólnot Mieszkaniowych\nJerzy Bajer\nul. Zygmunta Krasińskiego 4/2\n07-100 Węgrów\nTel: +48 728816495 NIP: 8240003999\nEmail: info@bajerszkolenia.pl", 40, 25, {align: "center", lineHeightFactor: 1})
        pdf.setFontSize(40)
        pdf.text(`ZAŚWIADCZENIE`, (210 - pdf.getTextWidth(`ZAŚWIADCZENIE`))/2, 80)
        pdf.setFont("ArialUTF", "normal")
        pdf.setFontSize(18)
        pdf.text("Niniejszym zaświadcza się, że", 25, 110)
        pdf.setFont("ArialUTF", "bold")
        pdf.setFontSize(26)
        pdf.setTextColor(blueColor)
        pdf.text(`${attendee}`, (210 - pdf.getTextWidth(`${attendee}`))/2, 130)
        pdf.setFont("ArialUTF", "normal")
        pdf.setFontSize(18)
        pdf.setTextColor(defaultColor)
        pdf.text("uczestniczył(a) w szkoleniu:", 25, 150)
        pdf.setFont("ArialUTF", "bold")
        pdf.setFontSize(20)
        const courseTitleOffsets = pdf.getTextDimensions(`${course.title}`, {maxWidth: 100})
        pdf.text(`${course.title}`, 105, 170, {maxWidth: 100, align: "center"})
        pdf.setFont("ArialUTF", "normal")
        pdf.setFontSize(15)
        pdf.setTextColor(defaultColor)
        pdf.text(`Szkolenie zostało zorganizowane przez Bajer Expert Szkolenia dla spółdzielni i wspólnot mieszkaniowych, w dniu ${getDateShortReadable(course.date, false, false)}, w godz. ${getTimeReadableWithoutTimezone(course.date)} - ${getTimeReadable((new Date(course.date.getTime() + (course.span as number)*60000)))}, w trybie ${course.place === 'Online' ? "online" : "stacjonarnym"}.`, 25, 185 + courseTitleOffsets.h, {maxWidth: 160})
        pdf.setFont("ArialUTF", "bold")
        pdf.setFontSize(8)
        pdf.setTextColor(blueColor)
        const stampXPlacement = 150
        const stampYPlacement = 210
        pdf.text("BAJER EXPERT\nCentrum Szkoleniowe Spółdzielni\ni Wspólnot Mieszkaniowych\nJerzy Bajer\nul. Zygmunta Krasińskiego 4/2\n07-100 Węgrów\nTel: +48 728816495 NIP: 8240003999\nEmail: info@bajerszkolenia.pl", stampXPlacement, stampYPlacement+courseTitleOffsets.h, {align: "center", lineHeightFactor: 1})
        pdf.setTextColor("#424242")
        pdf.setFontSize(6)
        pdf.text(`BAJER EXPERT | Wystawiono ${getDateLongGMT2Readable()}; Zapis #${signup.id}[${index+1}]; Szkolenie #${course.id}; ${key}`, 8, 290)
        if (attendee != signup.attendees.at(-1)){
            pdf.addPage()
        }
        keys.push(key)
    })
    return {
        key: keys,
        name: signup.attendees,
        signup: signup.id,
        course: course.id,
        issueDate: new Date,
        file: Buffer.from(pdf.output(), 'binary')
    }
}