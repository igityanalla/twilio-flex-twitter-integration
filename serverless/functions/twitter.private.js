const twitterClient = require('twit')({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET
})

async function fetchParticipantConversations (client, handle) {
  return client.conversations.participantConversations.list({
    identity: handle
  })
}

async function findExistingConversation (client, handle) {
  const conversations = await fetchParticipantConversations(client, handle)
  let existing = conversations.find(
    conversation => conversation.conversationState !== 'closed'
  )
  console.log('Existing: ', existing)
  return existing !== undefined ? existing.conversationSid : undefined
}

async function createConversation (client, handle) {
  return client.conversations.conversations.create({
    friendlyName: `Twitter_conversation_${handle}`
  })
}

async function createParticipant (client, conversationSid, handle) {
  return client.conversations
    .conversations(conversationSid)
    .participants.create({ identity: handle })
}

async function createScopedWebhooks (
  client,
  domainName,
  conversationSid,
  identity
) {
  await client.conversations.conversations(conversationSid).webhooks.create({
    'configuration.filters': 'onMessageAdded',
    target: 'studio',
    'configuration.flowSid': process.env.STUDIO_FLOW_SID
  })

  await client.conversations.conversations(conversationSid).webhooks.create({
    target: 'webhook',
    'configuration.filters': 'onMessageAdded',
    'configuration.method': 'POST',
    'configuration.url': `https://${domainName}/send-message?identity=${identity}`
  })
}

async function createMessage (client, conversationSid, author, body) {
  return client.conversations.conversations(conversationSid).messages.create({
    author,
    body,
    xTwilioWebhookEnabled: true
  })
}

async function sendMessageToFlex (client, domainName, identity, handle, body) {
  let existingConversationSid = await findExistingConversation(client, handle)
  if (existingConversationSid === undefined) {
    const { sid: conversationSid } = await createConversation(client, handle)
    console.log('Conversation SID: ', conversationSid)
    await createParticipant(client, conversationSid, handle)
    await createScopedWebhooks(client, domainName, conversationSid, identity)
    existingConversationSid = conversationSid
  }

  const { sid: messageSid } = await createMessage(
    client,
    existingConversationSid,
    handle,
    body
  )
  console.log('Message SID: ', messageSid)
}

async function sendMessageToTwitter (identity, body, replyOptions) {
  const messageData = packageTwitterMessageData(body, replyOptions)
  const url = 'direct_messages/events/new'
  const params = {
    event: {
      type: 'message_create',
      message_create: {
        target: {
          recipient_id: identity
        },
        message_data: messageData
      }
    }
  }

  await twitterClient.post(url, params, error => {
    if (error) {
      console.error(error)
    }
  })
}

const packageTwitterMessageData = (body, replyOptions) => {
  let optionsObj = {}
  if (replyOptions[0]) {
    const options = replyOptions.map(quickReply => ({
      label: quickReply,
      description: quickReply
    }))
    optionsObj = {
      quick_reply: {
        type: 'options',
        options
      }
    }
  }
  // Structure for message_data property on Twitter request
  const messageData = { text: body, ...optionsObj }
  return messageData
}

module.exports = { sendMessageToFlex, sendMessageToTwitter }
