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
let triggerResponses = {};

// Utility functions
const isValidImageUrl = (url) => /^https?:\/\/.*\.(jpg|jpeg|png|gif)$/.test(url);

client.once(Events.ClientReady, () => {
  console.log(`[${getTimestamp()}] [INFO] Logged in as ${client.user.tag}!`);
});

// Event handlers
client.on(Events.MessageCreate, async (message) => {
  console.log(`[${getTimestamp()}] [EVENT] Message received: ${message.content}`);
  const start = Date.now();

  try {
    if (message.content.startsWith('`image')) {
      const args = message.content.split(' ').slice(1);
      if (args.length === 0) {
        await message.channel.send("Please provide image URLs.");
      } else if (args.length > 10) {
        await message.channel.send("You can only send up to 10 images at once.");
      } else {
        for (const url of args) {
          const urlStart = Date.now();
          if (isValidImageUrl(url)) {
            const embed = new EmbedBuilder().setImage(url);
            await message.channel.send({ embeds: [embed] });
            console.log(`[${getTimestamp()}] [DEBUG] Sent image embed in ${Date.now() - urlStart}ms.`);
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
      await message.channel.send(`Ping! Bot latency is ${latency}ms.`);
      console.log(`[${getTimestamp()}] [INFO] WebSocket latency: ${latency}ms`);
    } else if (message.content.startsWith('`kill')) {
      try {
        const fetchStart = Date.now();
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
        console.error(`[${getTimestamp()}] [ERROR] Error in kill command: ${error}`);
      }
    }
  } catch (error) {
    console.error(`[${getTimestamp()}] [ERROR] Error handling message: ${error}`);
  } finally {
    console.log(`[${getTimestamp()}] [DEBUG] Message processed in ${Date.now() - start}ms.`);
  }
});

client.on(Events.ChannelCreate, async (channel) => {
  console.log(`[${getTimestamp()}] [EVENT] Channel created: ${channel.name}`);
});

client.on(Events.Error, (error) => {
  console.error(`[${getTimestamp()}] [ERROR] Client error: ${error}`);
});

// Log in to Discord with your app's token
client.login(mySecret).then(() => {
  console.log(`[${getTimestamp()}] [INFO] Bot started successfully.`);
}).catch((err) => {
  console.error(`[${getTimestamp()}] [ERROR] Bot failed to start: ${err}`);
});

// Log total execution time when the process exits
process.on('exit', () => {
  const programEndTime = Date.now();
  console.log(`[${getTimestamp()}] [INFO] Total execution time: ${programEndTime - programStartTime}ms.`);
});

process.on('SIGINT', () => {
  console.log(`[${getTimestamp()}] [INFO] Bot is shutting down...`);
  process.exit(0);
});
