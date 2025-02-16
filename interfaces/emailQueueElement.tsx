export interface emailQueueElement{
    id: number,
    subject: string,
    text: string,
    html?: string,
    from: string,
    to?: string[],
    cc?: string[],
    bcc: string[],
    attachments?: Buffer[],
    attachmentFileNames?: string[]
}