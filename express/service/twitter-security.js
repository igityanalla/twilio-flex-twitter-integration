const {createHmac} = require('crypto');

const generateTwitterToken = (crcToken) => {
    // Source: https://developer.twitter.com/en/docs/twitter-api/enterprise/account-activity-api/guides/securing-webhooks
    const hmac = createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET)
        .update(crcToken)
        .digest('base64');

    return `sha256=${hmac}`;
};

module.exports = generateTwitterToken;
