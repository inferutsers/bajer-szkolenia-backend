export default interface newsElement{
    id: Number,
    title: String,
    description?: String,
    date: Date, 
    pin: Boolean,  
    image?: Buffer,
    permissionRequired: number
}