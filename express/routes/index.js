var express = require('express')
var router = express.Router()
const generateTwitterToken = require('../service/twitter-security')
const {
  sendMessageToFlex,
  sendMessageToTwitter
} = require('../service/flex-twitter-integration')

// EP2: Twitter Security Check
router.get('/receive-message', (req, res) => {
  const crcToken = req.query.crc_token
  const resToken = generateTwitterToken(crcToken)

  res.status(200).json({ response_token: resToken })
})

router.post('/receive-message', (req, res) => {
  // Check it's an event of type direct message
  if (req.body.direct_message_events) {
    const users = req.body.users
    const customer = users[Object.keys(users)[0]]
    const twitterId = customer.id
    const twitterHandle = customer.screen_name
    // Check to make sure this is a message sent from the customer
    // rather than a Direct Message we sent on behalf of the agent from our app
    if (!req.body.direct_message_events[0].message_create.source_app_id) {
      const msg =
        req.body.direct_message_events[0].message_create.message_data.text
      sendMessageToFlex(twitterId, twitterHandle, msg)
    }
  }
  res.sendStatus(200)
})

router.post('/send-message', async function (req, res) {
  // Check to make sure this is a message sent from the agent
  if (req.body.Source === 'SDK') {
    const identity = req.query.identity
    const { Body: body, Attributes: attributes } = req.body
    const replyOptions = JSON.parse(attributes)
    console.log(replyOptions)
    sendMessageToTwitter(identity, body, replyOptions)
  }
})

module.exports = router
