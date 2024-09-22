import fs from 'fs'
export default function validateCRONSecret(secretProvided: String): boolean{
    const secret = fs.readFileSync("/home/ubuntu/autocron/secret.txt", 'ascii')
    const newSecret = Array(72).fill('').map(() => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        .charAt(Math.floor(Math.random() * 62))
    ).join('');
    fs.writeFileSync("/home/ubuntu/autocron/secret.txt", newSecret, 'ascii')
    if (secret == secretProvided) { 
        return true
    }
    return false
}