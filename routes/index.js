var express = require('express');
var router = express.Router();

router.post('/receive-message', async function (request, response) {
  console.log('Received a new message from Twitter');

});

router.post('/send-message', async function (request, response) {
  console.log('Twilio new message webhook fired, sending back to Twitter');


});

module.exports = router;
