import ADMcourseElement from "@/interfaces/ADMcourseElement";
import signupElement from "@/interfaces/signupElement";
import jsPDF from "jspdf";
import fs from "fs";

export default function generateInvoice(signup: signupElement, course: ADMcourseElement): String{
    const pdf = new jsPDF()
    const regularFont = fs.readFileSync("/home/ubuntu/backend/fonts/Arial-Unicode-Regular.ttf", 'binary')
    pdf.addFileToVFS('Arial-Unicode-Regular.ttf', regularFont);
    pdf.addFont('Arial-Unicode-Regular.ttf', 'ArialUTF', 'normal');
    const boldFont = fs.readFileSync("/home/ubuntu/backend/fonts/Arial-Unicode-Bold.ttf", 'binary')
    pdf.addFileToVFS('Arial-Unicode-Bold.ttf', boldFont);
    pdf.addFont('Arial-Unicode-Bold.ttf', 'ArialUTF', 'bold');
    pdf.setFont("ArialUTF", "bold")
    pdf.text("FAKTURA VAT NR 2137/2024", 25, 25)
    pdf.setFont("ArialUTF", "normal")
    pdf.setFontSize(15)
    pdf.text("Sprzedawca", 35, 47)
    pdf.line(25, 50, 75, 50)
    pdf.text("Nabywca", 149, 47)
    pdf.line(135, 50, 185, 50)
    pdf.setFontSize(8)
    const currentDate = new Date()
    const currentDateFormatted = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`
    pdf.text(`Wystawiona: ${currentDateFormatted}, Węgrów`, 140, 24)
    //SPRZEDAWCA
    pdf.text("BAJER EXPERT", 25, 55)
    pdf.text("Centrum Szkoleniowe Spółdzielni", 25, 58)
    pdf.text("i Wspólnot Mieszkaniowych Jerzy Bajer", 25, 61)
    pdf.text("ul. Zygmunta Krasińskiego 4/2", 25, 64)
    pdf.text("07-100 Węgrów", 25, 67)
    pdf.text("NIP: 8240003999", 25, 70)
    pdf.text("Tel: +48 728816495", 25, 73)
    pdf.text("Email: info@bajerszkolenia.pl", 25, 76)
    //NABYWCA
    if (signup.isCompany){
        const companyAdressSliced = signup.companyAdress!.split("|=|")
        const companyAdressStreet = companyAdressSliced[0]
        const companyAdressPostCode = companyAdressSliced[1]
        const companyAdressCity = companyAdressSliced[2]
        pdf.text(signup.companyName as string, 135, 55, {maxWidth: 50})
        const heightOffset = pdf.getTextDimensions(signup.companyName as string, {maxWidth: 50}).h - pdf.getTextDimensions("x").h
        pdf.text(companyAdressStreet, 135, 58 + heightOffset)
        pdf.text(`${companyAdressPostCode} ${companyAdressCity}`, 135, 61 + heightOffset)
        pdf.text(`NIP: ${signup.companyNIP}`, 135, 64 + heightOffset)
        pdf.text(`Tel: ${signup.phoneNumber}`, 135, 67 + heightOffset)
        pdf.text(`Email: ${signup.email}`, 135, 70 + heightOffset)
    } else {
        pdf.text(`${signup.name} ${signup.surname}`, 135, 55)
        pdf.text(`Tel: ${signup.phoneNumber}`, 135, 58)
        pdf.text(`Email: ${signup.email}`, 135, 61)
    }
    pdf.text("Sposób zapłaty: Przelew", 25, 90)
    //TABELA HEADER
    pdf.setFont("ArialUTF", "bold")
    pdf.text("LP", 25, 100)
    pdf.text("Nazwa usługi", 45, 100)
    pdf.text("Ilość", 85, 100)
    pdf.text("Wartość netto", 105, 100)
    pdf.text("VAT", 135, 100)
    pdf.text("Wartość brutto", 155, 100)
    pdf.setLineWidth(0.5)
    pdf.line(25, 102, 185, 102)
    //TABELA USLUGA
    pdf.setFont("ArialUTF", "normal")
    pdf.text("1", 25, 105)
    pdf.text(`${course.title} (${course.span} minut)`, 45, 105, { maxWidth: 40 })
    pdf.text("1 szt", 85, 105)
    pdf.text(`${(signup.supPrice as number / 1.23).toFixed(2)} PLN`, 105, 105)
    pdf.text("23%", 135, 105)
    pdf.text(`${String(signup.supPrice as number)} PLN`, 155, 105)
    const heightOffset = pdf.getTextDimensions(`${course.title} (${course.span} minut)`, {maxWidth: 40}).h - pdf.getTextDimensions("x").h
    pdf.line(25, 107 + heightOffset, 185, 107 + heightOffset)
    pdf.setFontSize(11)
    pdf.setFont("ArialUTF", "bold")
    pdf.text(`Razem: ${signup.supPrice} PLN`, 150, 112 + heightOffset, { maxWidth: 35 })
    pdf.text(`Do zapłaty pozostało: ${signup.supPrice as number - (signup.paidIn as number)} PLN`, 25, 130)
    return pdf.output()
}