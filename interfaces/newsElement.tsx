export default interface newsElement{
    id: number,
    title: string,
    description?: string,
    date: Date, 
    pin: boolean,  
    image?: Buffer,
    permissionRequired: number
}