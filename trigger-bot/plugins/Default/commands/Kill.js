const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require("discord.js");
const { SuccessEmbed } = require("../../../embeds");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("kill")
        .setDescription("Delete bot's last message")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    });
  }

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const message = messages
      .filter((message) => message.author.id === this.client.user.id)
      .first();

    if (message)
      try {
        await message.delete();
      } catch {
        console.error(err);
      }

    await interaction.editReply({
      embeds: [new SuccessEmbed("Successfully deleted bot's last message!")],
    });
  }
};
