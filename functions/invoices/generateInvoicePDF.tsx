import jsPDF from "jspdf";
import fs from "fs"
import PriceFormater from "price-to-words-pl"

export default function generateInvoicePDF(vat: number, invoiceNumber: string, isCompany: boolean, supPrice: number, courseTitle: string, paidIn: Number, name?: string, surname?: string, signupID?: number, phoneNumber?: string, email?: string, adress?: string, companyName?: string, companyNIP?: string ): String{
    const pdf = new jsPDF()
    const priceFormatter = new PriceFormater()
    const regularFont = fs.readFileSync("/home/ubuntu/backend/fonts/Arial-Unicode-Regular.ttf", 'binary')
    pdf.addFileToVFS('Arial-Unicode-Regular.ttf', regularFont);
    pdf.addFont('Arial-Unicode-Regular.ttf', 'ArialUTF', 'normal');
    const boldFont = fs.readFileSync("/home/ubuntu/backend/fonts/Arial-Unicode-Bold.ttf", 'binary')
    pdf.addFileToVFS('Arial-Unicode-Bold.ttf', boldFont);
    pdf.addFont('Arial-Unicode-Bold.ttf', 'ArialUTF', 'bold');
    pdf.setFont("ArialUTF", "bold")
    if (vat > 0){
        pdf.text(`FAKTURA VAT NR ${invoiceNumber}`, 25, 25)
    } else {
        pdf.text(`FAKTURA NR ${invoiceNumber}`, 25, 25)
    }
    pdf.setFont("ArialUTF", "normal")
    pdf.setFontSize(15)
    pdf.text("Sprzedawca", 35, 47)
    pdf.line(25, 50, 75, 50)
    pdf.text("Nabywca", 149, 47)
    pdf.line(135, 50, 185, 50)
    pdf.setFontSize(8)
    const currentDate = new Date()
    const currentDateFormatted = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    pdf.text(`Węgrów, dn. ${currentDateFormatted}`, 140, 24)
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
    if (isCompany){
        const companyAdressSliced = adress!.split("|=|")
        const companyAdressStreet = companyAdressSliced[0]
        const companyAdressPostCode = companyAdressSliced[1]
        const companyAdressCity = companyAdressSliced[2]
        pdf.text(companyName as string, 135, 55, {maxWidth: 50})
        const heightOffset = pdf.getTextDimensions(companyName as string, {maxWidth: 50}).h - pdf.getTextDimensions("x").h
        pdf.text(companyAdressStreet, 135, 58 + heightOffset)
        pdf.text(`${companyAdressPostCode} ${companyAdressCity}`, 135, 61 + heightOffset)
        pdf.text(`NIP: ${companyNIP}`, 135, 64 + heightOffset)
        if (phoneNumber){
        pdf.text(`Tel: ${phoneNumber}`, 135, 67 + heightOffset)
        }
        if (email){
            if (phoneNumber){
                pdf.text(`Email: ${email}`, 135, 70 + heightOffset)
            } else {
                pdf.text(`Email: ${email}`, 135, 67 + heightOffset)
            }
        }
    } else {
        pdf.text(`${name} ${surname}`, 135, 55)
        if (phoneNumber){
        pdf.text(`Tel: ${phoneNumber}`, 135, 58)
        }
        if (email){
            if (phoneNumber){
                pdf.text(`Email: ${email}`, 135, 61)
            } else {
                pdf.text(`Email: ${email}`, 135, 58)
            }
        }
    }
    pdf.text("Sposób zapłaty: Przelew", 25, 90)
    //TABELA HEADER
    pdf.setFont("ArialUTF", "bold")
    pdf.text("LP", 25, 100)
    pdf.text("Nazwa usługi", 45, 100)
    pdf.text("Ilość", 85, 100)
    pdf.text("Wartość netto", 95, 100)
    pdf.text("VAT", 120, 100)
    pdf.text("Wartość VAT", 130, 100)
    pdf.text("Wartość brutto", 155, 100)
    pdf.setLineWidth(0.5)
    pdf.line(25, 102, 185, 102)
    //TABELA USLUGA
    pdf.setFont("ArialUTF", "normal")
    pdf.text("1", 25, 105)
    pdf.text(`${courseTitle}`, 45, 105, { maxWidth: 40 })
    pdf.text("1 szt", 85, 105)
    const netto = (supPrice as number / (1 + (vat / 100)))
    const vatAmount = supPrice - netto
    pdf.text(`${netto.toFixed(2)} PLN`, 95, 105)
    if (vat > 0){
        pdf.text(`${vat}%`, 120, 105)
    } else {
        pdf.text("np", 120, 105)
    }
    pdf.text(`${vatAmount.toFixed(2)} PLN`, 130, 105)
    pdf.text(`${(supPrice as number).toFixed(2)} PLN`, 155, 105)
    const heightOffset = pdf.getTextDimensions(`${courseTitle}`, {maxWidth: 40}).h - pdf.getTextDimensions("x").h
    pdf.line(25, 107 + heightOffset, 185, 107 + heightOffset)
    pdf.setFontSize(11)
    pdf.setFont("ArialUTF", "bold")
    pdf.text(`Razem: ${supPrice.toFixed(2)} PLN`, 140, 112 + heightOffset, { maxWidth: 35 })
    pdf.text(`Do zapłaty pozostało: ${(supPrice as number - (paidIn as number)).toFixed(2)} PLN`, 25, 130)
    pdf.setFontSize(8)
    pdf.setFont("ArialUTF", "normal")
    pdf.text(`Slownie: ${priceFormatter.convert((supPrice as number - (paidIn as number)))}`, 25, 135)
    var notes = ""
    if (vat == 0){ 
        notes = notes + "Podstawa zwolnienia - Art. 113 ustawy VAT; "
    }
    if (signupID){
        notes = notes + `Numer identyfikacyjny zapisu - #${signupID}`
    } 
    if (notes != ""){
        pdf.text(`Uwagi: ${notes}`, 25, 145)
    }
    pdf.text(`Rachunek bankowy nr: PL37 1240 2731 1111 0011 3946 7964`, 25, 155)
    pdf.setLineWidth(0.2)
    pdf.line(25, 270, 75, 270)
    pdf.text("Osoba upoważniona", 37, 273)
    pdf.text("do odbioru faktury", 37, 276)
    pdf.line(135, 270, 185, 270)
    pdf.text("Osoba upoważniona", 147, 273)
    pdf.text("do wystawienia faktury", 147, 276)
    pdf.setFont("ArialUTF", "bold")
    pdf.setFontSize(10)
    pdf.text("Wiesława Bajer", 147, 268)
    return pdf.output()
}