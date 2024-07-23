export default async function getBufferFromString(image: string | null){
    if (!image) { return null }
    const buffer = Buffer.from(image)
    return buffer
}