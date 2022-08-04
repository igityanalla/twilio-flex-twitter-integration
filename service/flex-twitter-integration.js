require('dotenv').config()

const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const twitterClient = require('twit')({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET
})

async function fetchParticipantConversations (identity) {
  return client.conversations.participantConversations.list({
    identity
  })
}

async function findExistingConversation (identity) {
  const conversations = await fetchParticipantConversations(identity)
  let existing = conversations.find(
    conversation => conversation.conversationState !== 'closed'
  )
  console.log('Existing: ', existing)
  return existing !== undefined ? existing.conversationSid : undefined
}

async function createConversation (handle) {
  return client.conversations.conversations.create({
    friendlyName: `Twitter_conversation_${handle}`
  })
  // TODO full name in the attributes
}

async function createParticipant (conversationSid, identity, handle) {
  return client.conversations
    .conversations(conversationSid)
    .participants.create({ identity, attributes: { handle } })
}

async function createScopedWebhooks (conversationSid, identity) {
  await client.conversations.conversations(conversationSid).webhooks.create({
    'configuration.filters': 'onMessageAdded',
    target: 'studio',
    'configuration.flowSid': process.env.STUDIO_FLOW_SID
  })

  await client.conversations.conversations(conversationSid).webhooks.create({
    target: 'webhook',
    'configuration.filters': 'onMessageAdded',
    'configuration.method': 'POST',
    'configuration.url': `${process.env.WEBHOOK_BASE_URL}/send-message?identity=${identity}`
  })
}

async function createMessage (conversationSid, author, body) {
  return client.conversations.conversations(conversationSid).messages.create({
    author: author,
    body: body,
    xTwilioWebhookEnabled: true
  })
}

async function sendMessageToFlex (identity, handle, body) {
  let existingConversationSid = await findExistingConversation(identity)
  if (existingConversationSid === undefined) {
    const { sid: conversationSid } = await createConversation(handle)
    console.log('Conversation SID: ', conversationSid)
    await createParticipant(conversationSid, identity, handle)
    await createScopedWebhooks(conversationSid, identity)
    existingConversationSid = conversationSid
  }

  const { sid: messageSid } = await createMessage(
    existingConversationSid,
    identity,
    body
  )
  console.log('Message SID: ', messageSid)
}

async function sendMessageToTwitter (identity, body) {
  const url = 'direct_messages/events/new'
  const params = {
    event: {
      type: 'message_create',
      message_create: {
        target: {
          recipient_id: identity
        },
        message_data: {
          text: body
        }
      }
    }
  }

  await twitterClient.post(url, params, error => {
    if (error) {
      console.error(error)
    }
  })
}

module.exports = { sendMessageToFlex, sendMessageToTwitter }
