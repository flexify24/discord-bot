const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { ErrorEmbed, SuccessEmbed, DefaultEmbed } = require("../../../embeds");

const isValidImageUrl = (url) =>
  /^https?:\/\/.*\.(jpg|jpeg|png|gif)$/.test(url);

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("send-image")
        .setDescription("Send up to 10 images as embeds in the current channel")
        .addStringOption((option) =>
          option
            .setName("urls")
            .setDescription("Comma-separated image URLs (up to 10)")
            .setRequired(true)
        ),
    });
  }

  async execute(interaction) {
    const urls = interaction.options.getString("urls").split(",");

    if (urls.length > 10) {
      return interaction.reply({
        embeds: [new ErrorEmbed("You can send up to 10 images at a time.")],
        ephemeral: true,
      });
    }

    const embeds = [];
    for (const url of urls) {
      const trimmedUrl = url.trim();
      if (!isValidImageUrl(trimmedUrl)) {
        return interaction.reply({
          embeds: [
            new ErrorEmbed(
              `The URL "${trimmedUrl}" is not valid. Please ensure all URLs are valid.`
            ),
          ],
          ephemeral: true,
        });
      }

      const embed = new DefaultEmbed().setImage(trimmedUrl);
      embeds.push(embed);
    }

    for (const embed of embeds) {
      await interaction.channel.send({ embeds: [embed] });
    }

    await interaction.reply({
      embeds: [new SuccessEmbed("Images sent to the channel!")],
      ephemeral: true,
    });
  }
};
