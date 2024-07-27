import bcrypt from "bcrypt"
export default async function validateAndHashPassword(password: string): Promise<string | undefined>{
    if (password.length < 14) { return undefined}
    if (password === password.toLowerCase()) { return undefined }
    if (password === password.toUpperCase()) { return undefined }
    if (!(/\d/.test(password))) { return undefined }
    return await bcrypt.hash(password, 7)
}