exports.handler = async (context, event, callback) => {
    console.log('Twilio new message webhook fired');

    if (event.Source === 'SDK') {
        const identity = event.identity
        const body = event.Body
        const {sendMessageToTwitter} = require(Runtime.getFunctions().twitter.path)
        await sendMessageToTwitter(identity, body)
    }

    return callback();
};
