import ADMcourseElement from "@/interfaces/ADMcourseElement";
import jsPDF from "jspdf";
import fs from 'fs'
import { getDateLongGMT2Readable, getDateShortReadable } from "./dates";
import autoTable, { RowInput } from 'jspdf-autotable'
import signupElement from "@/interfaces/signupElement";
import administrationAccount from "@/interfaces/administrationAccount";

export default async function generateAttendeeListPDF(course: ADMcourseElement, signups: signupElement[], administrator: administrationAccount): Promise<Buffer>{
    const attendees = signups.map(signup => {
        const signupAttendees: RowInput[] = signup.attendees.map((attendee, index) => {
            if (index == 0) { return [{content: signup.companyName ? signup.companyName : "OSOBA PRYWATNA", rowSpan: signup.attendees.length, styles: { valign: "middle" }}, {content: (signup.paidIn >= signup.supPrice ? (signup.invoiceNumber ? `F #${signup.invoiceNumber}` : "O") : "NO"), rowSpan: signup.attendees.length, styles: { valign: "middle", halign: "center", textColor: signup.paidIn >= signup.supPrice ? false : [255, 0, 0], fontStyle: signup.paidIn >= signup.supPrice ? "normal" : "bold" }}, attendee, " "]}
            return [attendee, " "]
        })
        return signupAttendees
    }).flat()
    const courseName = course.title.length > 64 ? `${course.title.slice(0, 61)}...` : course.title
    const footer = `Raport wygenerowany ${getDateLongGMT2Readable()} Administrator #${administrator.id}; Szkolenie #${course.id} ${getDateShortReadable(course.date)}; Zapisów ${signups.length}; Uczestników ${attendees.length}\nW przypadku znalezienia listy przez osobę postronną prosimy o natychmiastowe zniszczenie\nBAJER EXPERT Centrum Szkoleniowe Spółdzielni i Wspólnot Mieszkaniowych Jerzy Bajer ul. Zygmunta Krasińskiego 4/2 07-100 Węgrów NIP: 8240003999 Tel: +48 728816495 Email: info@bajerszkolenia.pl`
    const pdf = new jsPDF
    const regularFont = fs.readFileSync("/home/ubuntu/backend/fonts/Arial-Unicode-Regular.ttf", 'binary')
    pdf.addFileToVFS('Arial-Unicode-Regular.ttf', regularFont);
    pdf.addFont('Arial-Unicode-Regular.ttf', 'ArialUTF', 'normal');
    const boldFont = fs.readFileSync("/home/ubuntu/backend/fonts/Arial-Unicode-Bold.ttf", 'binary')
    pdf.addFileToVFS('Arial-Unicode-Bold.ttf', boldFont);
    pdf.addFont('Arial-Unicode-Bold.ttf', 'ArialUTF', 'bold');
    pdf.setFont("ArialUTF", "bold")
    pdf.setFontSize(30)
    pdf.text("BAJER EXPERT", 8, 16)
    pdf.setFontSize(20)
    pdf.text(`Lista uczestników (${attendees.length})`, 95, 15)
    pdf.setFont("ArialUTF", "normal")
    pdf.setFontSize(15)
    pdf.text(`Szkolenie: ${courseName}`, 8, 23)
    pdf.text(`Data: ${getDateLongGMT2Readable(course.date)}`, 8, 29)
    pdf.setFontSize(6)
    pdf.text(footer, 8, 286)
    autoTable(pdf, {
        head: [['Klient', 'Status', 'Uczestnicy', 'Podpis']],
        body: attendees,
        margin: { top: 20, left: 8, right: 8, bottom: 20 },
        startY: 33,
        theme: 'grid',
        pageBreak: 'auto',
        tableWidth: 194,
        styles: {font: "ArialUTF"},
        columnStyles: {0: {cellWidth: 50}, 1: {cellWidth: 20}, 2: {cellWidth: 45}, 3: {cellWidth: 79}},
        headStyles: { fillColor: [147, 51, 234] },
        didDrawPage: () => { pdf.text(footer, 8, 286) }
      })
    return Buffer.from(pdf.output(), 'binary')
}