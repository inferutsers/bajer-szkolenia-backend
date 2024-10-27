import speakeasy from 'speakeasy'

export function tfaMatcher(secret: string, token: string): boolean{
    return speakeasy.totp.verify({
        secret: secret,
        token: token,
        step: Number(process.env.TFAPERIOD),
        digits: Number(process.env.TFADIGITS)
    })
}

export function generateTfa(): {secret: string, setupLink: string}{
    const tfasecret = speakeasy.generateSecret().base32
    return { secret: tfasecret, setupLink: speakeasy.otpauthURL({
        secret: tfasecret,
        label: process.env.TFALABEL as string,
        type: 'totp',
        issuer: process.env.TFAISSUER as string,
        digits: Number(process.env.TFADIGITS),
        period: Number(process.env.TFAPERIOD)
    })}
}