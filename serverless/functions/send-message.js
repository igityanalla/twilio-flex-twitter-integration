exports.handler = async (context, event, callback) => {
  console.log('Twilio new message webhook fired')

  if (event.Source === 'SDK') {
    const identity = event.identity
    const { Body: body, Attributes: attributes } = event
    const replyOptions = JSON.parse(attributes)
    const { sendMessageToTwitter } = require(Runtime.getFunctions().twitter
      .path)
    await sendMessageToTwitter(identity, body, replyOptions)
  }

  return callback()
}
