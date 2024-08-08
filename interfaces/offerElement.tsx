import courseElement from "./courseElement";

export default interface offerElement{
    id: number,
    name: string,
    courses?: courseElement[],
    price: number,
    note?: string,
    available: boolean,
    dateCreated: Date,
    fileName?: string
}