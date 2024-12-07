const { Command } = require("../../../structures");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require("discord.js");
const { SuccessEmbed, ErrorEmbed } = require("../../../embeds");
const fs = require("fs");

const imagesPath = "./data/images.json";

if (!fs.existsSync(imagesPath)) {
  fs.writeFileSync(imagesPath, JSON.stringify([]));
}

const isValidImageUrl = (url) =>
  /^https?:\/\/.*\.(jpg|jpeg|png|gif)$/.test(url);

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      data: new SlashCommandBuilder()
        .setName("image")
        .setDescription("Manage images")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add a new image")
            .addStringOption((option) =>
              option
                .setName("name")
                .setDescription("The name of the image")
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("url")
                .setDescription("The URL of the image")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove an existing image")
            .addStringOption((option) =>
              option
                .setName("name")
                .setDescription("The name of the image to remove")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand.setName("list").setDescription("List all images")
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("update")
            .setDescription("Update the URL of an existing image")
            .addStringOption((option) =>
              option
                .setName("name")
                .setDescription("The name of the image to update")
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("new-url")
                .setDescription("The new URL for the image")
                .setRequired(true)
            )
        ),
    });
  }

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const images = JSON.parse(fs.readFileSync(imagesPath, "utf-8"));

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "add") {
      const name = interaction.options.getString("name");
      const url = interaction.options.getString("url");

      if (!isValidImageUrl(url))
        return interaction.editReply({
          embeds: [new ErrorEmbed("Provided URL is not valid image URL.")],
        });

      if (images.some((img) => img.name === name)) {
        return interaction.editReply({
          embeds: [
            new ErrorEmbed(`Image with the name "${name}" already exists.`),
          ],
        });
      }

      images.push({ name, url });
      fs.writeFileSync(imagesPath, JSON.stringify(images, null, 2));

      return interaction.editReply({
        embeds: [new SuccessEmbed(`Image "${name}" has been added.`)],
      });
    } else if (subcommand === "remove") {
      const name = interaction.options.getString("name");

      const index = images.findIndex((img) => img.name === name);
      if (index === -1) {
        return interaction.editReply({
          embeds: [new ErrorEmbed(`Image with the name "${name}" not found.`)],
        });
      }

      images.splice(index, 1);
      fs.writeFileSync(imagesPath, JSON.stringify(images, null, 2));

      return interaction.editReply({
        embeds: [new SuccessEmbed(`Image "${name}" has been removed.`)],
      });
    } else if (subcommand === "list") {
      if (images.length === 0) {
        return interaction.editReply({
          embeds: [new SuccessEmbed("No images found.")],
        });
      }

      const imageList = images
        .map((img, i) => `${i + 1}. **Name:** ${img.name}\n**URL:** ${img.url}`)
        .join("\n\n");

      return interaction.editReply({
        embeds: [
          new SuccessEmbed().setTitle("Images List").setDescription(imageList),
        ],
      });
    } else if (subcommand === "update") {
      const name = interaction.options.getString("name");
      const newUrl = interaction.options.getString("new-url");

      if (!isValidImageUrl(newUrl))
        return interaction.editReply({
          embeds: [new ErrorEmbed("Provided URL is not valid image URL.")],
        });

      const image = images.find((img) => img.name === name);
      if (!image) {
        return interaction.editReply({
          embeds: [new ErrorEmbed(`Image with the name "${name}" not found.`)],
        });
      }

      image.url = newUrl;
      fs.writeFileSync(imagesPath, JSON.stringify(images, null, 2));

      return interaction.editReply({
        embeds: [new SuccessEmbed(`Image "${name}" has been updated.`)],
      });
    }
  }
};
