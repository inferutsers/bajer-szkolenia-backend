import offerElement from "./offerElement";

export default interface courseElement{
    id: number,
    date: Date,
    span: number,
    price: number,
    title: string,
    place?: string,
    instructor?: string,
    note?: string,
    slots: number,
    slotAvailable?: boolean,
    available: boolean,
    dateCreated: Date,
    fileName?: string,
    customURL: string,
    offers?: offerElement[]
}