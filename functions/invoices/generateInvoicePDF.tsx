import jsPDF from "jspdf";
import fs from "fs"
import PriceFormater from "price-to-words-pl"

export default function generateInvoicePDF(vat: number, invoiceNumber: string, isCompany: boolean, adress: string, supPrice: number, courseTitle: string, amount: number, paidIn: Number, name?: string, surname?: string, signupID?: number, phoneNumber?: string, email?: string, companyName?: string, companyNIP?: string, clientPesel?: string): string{
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
    pdf.text(`Miejsce wystawienia: Węgrów`, 140, 24)
    pdf.text(`Data wystawienia: ${currentDateFormatted}`, 140, 27)
    pdf.text(`Data sprzedaży: ${currentDateFormatted}`, 140, 30)
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
    const adressSliced = adress!.split("|=|")
    const adressStreet = adressSliced[0]
    const adressPostCode = adressSliced[1]
    const adressCity = adressSliced[2]
    const buyerName = (isCompany ? companyName as string : `${name} ${surname}`)
    pdf.text(buyerName, 135, 55, {maxWidth: 50})
    var nameHeightOffset = pdf.getTextDimensions(buyerName, {maxWidth: 50}).h - pdf.getTextDimensions("x").h
    pdf.text(adressStreet, 135, 58 + nameHeightOffset)
    pdf.text(`${adressPostCode} ${adressCity}`, 135, 61 + nameHeightOffset)
    if (isCompany){
        pdf.text(`NIP: ${companyNIP}`, 135, 64 + nameHeightOffset)
        if (phoneNumber){
        pdf.text(`Tel: ${phoneNumber}`, 135, 67 + nameHeightOffset)
        }
        if (email){
            if (phoneNumber){
                pdf.text(`Email: ${email}`, 135, 70 + nameHeightOffset)
            } else {
                pdf.text(`Email: ${email}`, 135, 67 + nameHeightOffset)
            }
        }
    } else {
        if (clientPesel){
            pdf.text(`Pesel: ${clientPesel}`, 135, 64 + nameHeightOffset)
        }
        if (phoneNumber){
            pdf.text(`Tel: ${phoneNumber}`, 135, 64 + nameHeightOffset + (clientPesel ? 3 : 0))
        }
        if (email){
            if (phoneNumber){
                pdf.text(`Email: ${email}`, 135, 67 + nameHeightOffset + (clientPesel ? 3 : 0))
            } else {
                pdf.text(`Email: ${email}`, 135, 64 + nameHeightOffset + (clientPesel ? 3 : 0))
            }
        }
    }
    pdf.text("Sposób zapłaty: Przelew", 25, 90)
    //TABELA HEADER
    pdf.setFont("ArialUTF", "bold")
    pdf.text("LP", 25, 100)
    pdf.text("Nazwa usługi", 30, 100)
    pdf.text("Ilość", 70, 100)
    pdf.text("Cena netto", 80, 100)
    pdf.text("Wartość netto", 100, 100)
    pdf.text("VAT", 120, 100)
    pdf.text("Wartość VAT", 130, 100)
    pdf.text("Wartość brutto", 155, 100)
    pdf.setLineWidth(0.5)
    pdf.line(25, 102, 185, 102)
    //TABELA USLUGA
    pdf.setFont("ArialUTF", "normal")
    pdf.text("1", 25, 105)
    pdf.text(`${courseTitle}`, 30, 105, { maxWidth: 40 })
    pdf.text(`${amount} szt`, 70, 105)
    const netto = (supPrice as number / (1 + (vat / 100)))
    const vatAmount = supPrice - netto
    pdf.text(`${(netto / amount).toFixed(2)} PLN`, 80, 105)
    pdf.text(`${netto.toFixed(2)} PLN`, 100, 105)
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
    pdf.text(`Razem: ${supPrice.toFixed(2)} PLN`, 135, 112 + heightOffset, { maxWidth: 45 })
    pdf.text(`Zapłacono: ${(paidIn as number).toFixed(2)} PLN`, 25, 130)
    pdf.text(`Do zapłaty pozostało: ${(supPrice as number - (paidIn as number)).toFixed(2)} PLN`, 25, 135)
    pdf.setFontSize(8)
    pdf.setFont("ArialUTF", "normal")
    pdf.text(`Slownie: ${priceFormatter.convert((supPrice as number - (paidIn as number)))}`, 25, 140)
    var notes = ""
    if (vat == 0){ 
        notes = notes + "Podstawa zwolnienia - Art. 113 ustawy VAT; "
    }
    if (signupID){
        notes = notes + `Numer identyfikacyjny zapisu - #${signupID}`
    } 
    if (notes != ""){
        pdf.text(`Uwagi: ${notes}`, 25, 150)
    }
    pdf.text(`Rachunek bankowy nr: PL37 1240 2731 1111 0011 3946 7964`, 25, 160)
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