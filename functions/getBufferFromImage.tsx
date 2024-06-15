export default async function getBufferFromImage(image: string | null){
    if (!image) { return null }
    const buffer = Buffer.from(image)
    return buffer
}