var express = require('express');
var router = express.Router();
const generateTwitterToken = require('../service/twitter-security');
const sendMessageToFlex = require('../service/flex-twitter-integration');

// EP2: Twitter Security Check
router.get('/receive-message', (req, res) => {
    const crcToken = req.query.crc_token
    const resToken = generateTwitterToken(crcToken)

    res.status(200).json({response_token: resToken})
});

router.post('/receive-message', (req, res) => {
    if (req.body.direct_message_events) {
        console.log('Testing webhook')
        const users = req.body.users;
        const customer = users[Object.keys(users)[0]];
        const twitterHandle = customer.screen_name;
        const twitterId = customer.id;
        // Check to make sure this is a message sent from the customer
        // rather than a Direct Message we sent on behalf of the agent from our app
        if (!req.body.direct_message_events[0].message_create.source_app_id) {
            const msg =
                req.body.direct_message_events[0].message_create.message_data.text;
            // functions.sendMessageToFlex(twilioClient, msg, twitterHandle, twitterId);
            sendMessageToFlex();
        }
    }
    res.sendStatus(200)
})

router.post('/send-message', async function (request, response) {
    console.log('Twilio new message webhook fired, sending back to Twitter');
});

module.exports = router;
