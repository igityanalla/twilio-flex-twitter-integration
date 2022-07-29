require('dotenv').config();

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

async function fetchParticipantConversations(twitterHandle) {
    return client.conversations.participantConversations
        .list({identity: twitterHandle});
}

async function findExistingConversation(identity) {
    const conversations = await fetchParticipantConversations(identity);
    let existing = conversations.find(conversation => conversation.conversationState !== 'closed');
    console.log("Existing: ", existing);
    return existing !== undefined ? existing.conversationSid : undefined;
}

async function createConversation(twitterHandle) {
    return client.conversations.conversations
        .create({
            friendlyName: `Twitter_conversation_${twitterHandle}`
        });
    // TODO full name in the attributes
}

async function createParticipant(conversationSid, identity) {
    return client.conversations.conversations(conversationSid)
        .participants
        .create({identity: identity});
}

async function createScopedWebhooks(conversationSid) {
    await client.conversations.conversations(conversationSid)
        .webhooks
        .create({
            'configuration.filters': 'onMessageAdded',
            target: 'studio',
            'configuration.flowSid': process.env.STUDIO_FLOW_SID
        });

    await client.conversations.conversations(conversationSid)
        .webhooks
        .create({
            target: 'webhook',
            'configuration.filters': 'onMessageAdded',
            'configuration.method': 'POST',
            'configuration.url': `${process.env.WEBHOOK_BASE_URL}/xxxxxx`,
        })
}

async function createMessage(conversationSid, author, body) {
    return client.conversations.conversations(conversationSid)
        .messages
        .create({
            author: author,
            body: body,
            xTwilioWebhookEnabled: true
        });
}

async function sendMessageToFlex(twitterHandle, body) {
    let existingConversationSid = await findExistingConversation(twitterHandle);
    if (existingConversationSid === undefined) {
        const {sid: conversationSid} = await createConversation(twitterHandle);
        console.log("Conversation SID: ", conversationSid);
        await createParticipant(conversationSid, twitterHandle);
        await createScopedWebhooks(conversationSid);
        existingConversationSid = conversationSid;
    }

    const {sid: messageSid} = await createMessage(existingConversationSid, twitterHandle, body);
    console.log("Message SID: ", messageSid);
}

module.exports = sendMessageToFlex;
