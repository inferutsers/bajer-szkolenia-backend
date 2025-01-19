export interface certificateData{
    key: string[],
    name: string[],
    signup: number,
    course: number,
    issueDate: Date,
    file?: Buffer
}