const { Event } = require("../../../structures");
const { ChannelType, Events } = require("discord.js");

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: Events.InteractionCreate,
      enabled: true,
    });
  }
  async run(interaction) {
    if (!interaction.isCommand()) return;
    if (interaction.channel.type === ChannelType.DM) return;
    const command = this.client.commands.get(interaction.commandName);
    if (command) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.log(`An error ocurred: ${error.stack}`);
      }
    }
  }
};
