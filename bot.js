const { Client, GatewayIntentBits, EmbedBuilder, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Utility function for timestamps
const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleString("en-IE", {
    timeZone: "Europe/Dublin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

// Track the program's start time
const programStartTime = Date.now();

// Initialization and configuration
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const mySecret = process.env['DISCORD_TOKEN'];
console.log(`[${getTimestamp()}] [INFO] Token: ${mySecret}`);
const imageList = [];
const triggeredChannels = new Set();
let triggerResponses = {}

// Utility functions
const isValidImageUrl = (url) => /^https?:\/\/.*\.(jpg|jpeg|png|gif)$/.test(url);


client.once(Events.ClientReady, () => {
  console.log(`[${getTimestamp()}] [INFO] Logged in as ${client.user.tag}!`);
});

// Event handlers
client.on(Events.MessageCreate, async (message) => {
  const start = Date.now();
  if (message.content.startsWith('`image')) {
    const args = message.content.split(' ').slice(1);
    if (args.length === 0) {
      await message.channel.send("Please provide image URLs.");
    } else if (args.length > 10) {
      await message.channel.send("You can only send up to 10 images at once.");
    } else {
      for (const url of args) {
        if (isValidImageUrl(url)) {
          const embed = new EmbedBuilder().setImage(url);
          await message.channel.send({ embeds: [embed] });
        } else {
          await message.channel.send(`Invalid image URL: ${url}`);
        }
      }
    }
  } else if (message.content.startsWith('`randomimage')) {
    if (imageList.length > 0) {
      const randomUrl = imageList[Math.floor(Math.random() * imageList.length)];
      const embed = new EmbedBuilder().setImage(randomUrl);
      await message.channel.send({ embeds: [embed] });
    } else {
      await message.channel.send("No images available in the list.");
    }
  } else if (message.content.startsWith('`addimage')) {
    const url = message.content.split(' ')[1];
    if (isValidImageUrl(url)) {
      imageList.push(url);
      await message.channel.send(`Image added: ${url}`);
    } else {
      await message.channel.send("Invalid image URL. Please provide a valid image link (jpg, png, gif).");
    }
  } else if (message.content.startsWith('`removeimage')) {
    const url = message.content.split(' ')[1];
    if (imageList.includes(url)) {
      imageList.splice(imageList.indexOf(url), 1);
      await message.channel.send(`Image removed: ${url}`);
    } else {
      await message.channel.send("Image not found in the list.");
    }
  } else if (message.content.startsWith('`ping')) {
    const latency = client.ws.ping;
    console.log(`[${getTimestamp()}] WebSocket latency ${latency}ms.`);
    await message.channel.send(`Ping! Bot latency is ${latency}ms.`);
  } else if (message.content.startsWith('`kill')) {
    try {
      const fetchedMessages = await message.channel.messages.fetch({ limit: 50 });
      console.log(`[${getTimestamp()}] [DEBUG] Fetched messages in ${Date.now() - fetchStart}ms.`);
      const botMessage = fetchedMessages.find(msg => msg.author.id === client.user.id);
      if (botMessage) {
        await botMessage.delete();
        const sentMessage = await message.channel.send("Deleted my last message.");
        setTimeout(() => sentMessage.delete(), 1000);
      } else {
        const sentMessage = await message.channel.send("No recent messages from me to delete.");
        setTimeout(() => sentMessage.delete(), 1000);
      }
    } catch (error) {
      console.error(`[${getTimestamp()}] Error in kill command: ${error}`);
    }
    console.log(`[${getTimestamp()}] [DEBUG] Message processed in ${Date.now() - start}ms.`);
  }
});

const shouldRespond = (channelId) => !triggeredChannels.has(channelId);

client.on(Events.ChannelCreate, async (channel) => {
  for (const [trigger, response] of Object.entries(triggerResponses)) {
    if (channel.name.toLowerCase().includes(trigger.toLowerCase()) && shouldRespond(channel.id)) {
      await respondToTrigger(channel, response);
      triggeredChannels.add(channel.id);
    }
  }
});

async function respondToTrigger(channel, response) {
  if (response.text) {
    await channel.send(response.text);
  }
}

let triggers = new Map(); // In-memory storage of triggers
// Listen for messages to add trigger words
client.on(Events.MessageCreate, async (message) => {
  // Add trigger command (e.g., `janes <word> <response>`)
  if (message.content.startsWith('`janes')) {
    const args = message.content.split(' ').slice(1);
    if (args.length < 2) {
      await message.channel.send("Usage: `janes <word> <response>`");
      return;
    }
    const triggerWord = args[0].toLowerCase();
    const responseText = args.slice(1).join(' ');
    triggers.set(triggerWord, responseText);
    await message.channel.send(`Trigger added: "${triggerWord}"`);
  }
// List all triggers
  else if (message.content === '`listjanes') {
    if (triggers.size === 0) {
      await message.channel.send("No triggers have been set.");
    } else {
      const triggerList = Array.from(triggers.entries()).map(
        ([word, response]) => `"${word}" : "${response}"`
      ).join('\n');
      await message.channel.send(`Current triggers:\n${triggerList}`);
    }
  }
  // Remove trigger command (e.g., `removejanes <word>`)
  else if (message.content.startsWith('`removejanes')) {
    const args = message.content.split(' ').slice(1);
    const triggerWord = args[0]?.toLowerCase();
    if (!triggerWord || !triggers.has(triggerWord)) {
      await message.channel.send(`Trigger not found: "${triggerWord}".`);
    } else {
      triggers.delete(triggerWord);
      await message.channel.send(`Trigger removed: "${triggerWord}".`);
    }
  }
  // Update trigger command (e.g., `updatejanes <word> <newResponse>`)
  else if (message.content.startsWith('`updatejanes')) {
    const args = message.content.split(' ').slice(1);
    const triggerWord = args[0]?.toLowerCase();
    const newResponseText = args.slice(1).join(' ');
    if (!triggerWord || !newResponseText) {
      await message.channel.send("Usage: `updatejanes <word> <newResponse>`");
    } else if (!triggers.has(triggerWord)) {
      await message.channel.send(`Trigger not found: "${triggerWord}".`);
    } else {
      triggers.set(triggerWord, newResponseText);
      await message.channel.send(`Trigger updated: "${triggerWord}"`);
    }
  }
});

// Listen for new channels and check their names for triggers
client.on(Events.ChannelCreate, async (channel) => {
  const channelNameLower = channel.name.toLowerCase();
  for (let [triggerWord, responseText] of triggers.entries()) {
    if (channelNameLower.includes(triggerWord)) {
      try {
        await channel.send(responseText);
      } catch (error) {
        console.error(`Could not send message in ${channel.name}:`, error);
      }
      break; // Stop checking after the first matching trigger
    }
  }
});

client.on(Events.Error, console.error);

// Log in to Discord with your app's token
client.login(mySecret);