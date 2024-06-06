export default interface mailStructure{
    messageID?: String,
    receivers: String[],
    subject: String,
    text: String,
    html: String,
    failure: Boolean
}