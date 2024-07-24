export default interface ADMcourseElement{
    id: number,
    date: Date,
    span: number,
    price: number,
    title: string,
    place?: string,
    instructor?: string,
    note?: string,
    slots: number,
    slotsUsed: number,
    available: boolean,
    dateCreated: Date,
    fileName?: string,
    customURL?: string
}