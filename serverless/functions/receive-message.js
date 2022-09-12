exports.handler = async (context, event, callback) => {
  if (event.crc_token) {
    console.log('Twitter security check...')
    const { generateTwitterToken } = require(Runtime.getFunctions().security
      .path)
    const resToken = generateTwitterToken(event.crc_token)
    callback(null, { response_token: resToken })
  }

  if (event.direct_message_events) {
    console.log('Received a new message from Twitter')
    const users = event.users
    const customer = users[Object.keys(users)[0]]
    const twitterId = customer.id
    const twitterHandle = customer.screen_name
    const client = context.getTwilioClient()
    const domainName = context.DOMAIN_NAME
    // Check to make sure this is a message sent from the customer
    // rather than a Direct Message we sent on behalf of the agent from our app
    if (!event.direct_message_events[0].message_create.source_app_id) {
      const msg =
        event.direct_message_events[0].message_create.message_data.text
      const { sendMessageToFlex } = require(Runtime.getFunctions().twitter.path)
      await sendMessageToFlex(client, domainName, twitterId, twitterHandle, msg)
    }
  }

  return callback()
}
