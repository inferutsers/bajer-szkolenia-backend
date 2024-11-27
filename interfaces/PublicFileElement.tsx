// export interface PublicFileElement{
//     id: number,
//     data: Buffer,
//     fileName: string,
//     available: boolean,
//     watermarked: boolean
// }

// export interface PublicFileKey{
//     id: number,
//     key: string,
//     owner?: number,
//     available: boolean,
//     usages: number,
//     usageLimit?: number,
//     fileID: number
// }

export interface ADMPublicFileOutline{
    id: number,
    fileName: string,
    available: boolean,
    downloads: number,
    keys: ADMPublicFileKey[]
}

export interface ADMPublicFileKey{
    id: number,
    key: string, 
    note: string,
    available: boolean,
    usages: number,
    usageLimit?: number,
    expiryDate?: Date
}

export interface PublicFileData{
    id: number,
    key_id: number,
    data: Buffer,
    fileName: string
}