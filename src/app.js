require('dotenv').config();
const cron = require('node-cron');
const { App } = require('@slack/bolt');
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN
});

// Test channel
const channelId = "C06MQ0VSN6L";

// Main channel
//const channelId = "C06MQ0VSN6L";

const addEmojis = async (ts) => {
    await app.client.reactions.add({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channelId,
        name: 'sparkles',
        timestamp: ts
    });
}

const sendMessageBlock = async () => {
    let result = await app.client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channelId,
        text: "Ask @Miguel Ángel",
    });
    addEmojis(result.ts);
}

app.message('hey copilot', async ({ message, say }) => {
    const msg = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        system: "Your name is Feelslike Copilot and you are always in a hurry, as your supreme boss Marcelo wants things very fast and eficient.",
        max_tokens: 1000,
        temperature: 0,
        messages: [{ role: "user", content: message.text.replace("hey copilot", "") }]
      });
      for (const item of msg.content) {
        if(item.type === "text") await say(item.text);
      }
  });

app.command('/imagine', async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();
    console.log(command.text);
    sendMessageBlock();
  });

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();


