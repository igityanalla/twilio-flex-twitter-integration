# Twilio Flex Twitter Plugin

Twilio Flex Plugins allow you to customize the appearance and behavior of [Twilio Flex](https://www.twilio.com/flex). If you want to learn more about the capabilities and how to use the API, check out our [Flex documentation](https://www.twilio.com/docs/flex). This plugin makes Twitter specific additions to the Flex Agent experience:
* Displays the Twitter icon for Twitter-related communications in the task list
* Adds an interface for appending Twitter Quick Replies to agent messages

![Image of Flex Plugin for Twitter](https://user-images.githubusercontent.com/46247485/189676226-62f017b9-8351-406a-ab22-f34eb269e9fc.png)

## Setup
This plugin assumes that any Twitter-related tasks will be created with an additional `customChannel` attribute which has a value of `Twitter`. If you're using Twilio Studio, you can add this key:value to the boilerplate JSON that you'll find under the attributes in the [Send To Flex widget](https://www.twilio.com/docs/studio/widget-library/send-flex). Your attributes should look something like this
```json
{
   "name":"{{trigger.message.ChannelAttributes.from}}",
   "channelType":"web",
   "channelSid":"{{trigger.message.ChannelSid}}",
   "customChannel":"Twitter"
}
```

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com). We support Node >= 10.12 (and recommend the _even_ versions of Node). Afterwards, install the dependencies by running `npm install`:

```bash
cd 

# If you use npm
npm install
```

Next, please install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) by running:

```bash
brew tap twilio/brew && brew install twilio
```

Finally, install the [Flex Plugin extension](https://github.com/twilio-labs/plugin-flex/tree/v1-beta) for the Twilio CLI:

```bash
twilio plugins:install @twilio-labs/plugin-flex
```

## Development

Run `twilio flex:plugins --help` to see all the commands we currently support. For further details on Flex Plugins refer to our documentation on the [Twilio Docs](https://www.twilio.com/docs/flex/developer/plugins/cli) page.

