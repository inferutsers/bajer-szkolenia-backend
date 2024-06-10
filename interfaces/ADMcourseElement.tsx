export default interface ADMcourseElement{
    id: Number,
    date: Date,
    span: Number,
    price: Number,
    title?: String,
    place?: String,
    instructor?: String,
    note?: String,
    slots: Number,
    slotsUsed: Number,
    available: Boolean
}