const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DefaultEmbed, ErrorEmbed } = require("../../../embeds");
const fs = require("fs");

const imagesPath = "./data/images.json";

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("random-image")
        .setDescription("Send a random image URL from images.json"),
    });
  }

  async execute(interaction) {
    if (!fs.existsSync(imagesPath)) {
      return interaction.reply({
        embeds: [new ErrorEmbed("The `images.json` file does not exist.")],
        ephemeral: true,
      });
    }

    const images = JSON.parse(fs.readFileSync(imagesPath, "utf-8"));

    if (images.length === 0) {
      return interaction.reply({
        embeds: [new ErrorEmbed("No images available in `images.json`.")],
        ephemeral: true,
      });
    }

    const randomImage = images[Math.floor(Math.random() * images.length)];

    const embed = new DefaultEmbed()
      .setTitle(randomImage.name)
      .setImage(randomImage.url)
      .setColor(0x00aaff);

    await interaction.reply({ embeds: [embed] });
  }
};
