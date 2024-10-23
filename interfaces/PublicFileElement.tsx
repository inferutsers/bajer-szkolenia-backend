export interface PublicFileElement{
    id: number,
    data: Buffer,
    fileName: string,
    available: boolean,
    watermarked: boolean
}

export interface PublicFileKey{
    id: number,
    key: string,
    owner?: number,
    available: boolean,
    usages: number,
    usageLimit?: number,
    fileID: number
}