export default interface administrationAccount{
    id: Number,
    login: String,
    displayName: String,
    password?: String,
    status: number,
    sessionID?: String,
    sessionValidity?: Date,
    passwordResetToken?: String,
    tfaSecret: String 
}