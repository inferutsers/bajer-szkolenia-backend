export default interface administrationAccount{
    id: number,
    login: string,
    displayName: string,
    password?: string,
    status: number,
    sessionID?: string,
    sessionValidity?: Date,
    passwordResetToken?: string,
    tfaSecret?: string,
    technicalBreak?: string
}