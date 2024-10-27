export default interface mailStructure{
    date: string,
    messageID?: string,
    response?: string,
    receivers: string[],
    subject: string,
    text: string,
    html: string,
    failure: boolean
}