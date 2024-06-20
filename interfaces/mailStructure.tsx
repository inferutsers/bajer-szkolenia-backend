export default interface mailStructure{
    date: String,
    messageID?: String,
    response?: String,
    receivers: String[],
    subject: String,
    text: String,
    html: String,
    failure: Boolean
}